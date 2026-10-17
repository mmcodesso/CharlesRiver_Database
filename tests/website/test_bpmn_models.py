"""Presentation checks for editable Draw.io teaching models, not executable BPMN."""

from __future__ import annotations

from collections import defaultdict
import hashlib
import html
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET

import pytest


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "static" / "diagrams" / "bpmn"
MODELS = json.loads((ROOT / "src" / "data" / "bpmnModels.json").read_text(encoding="utf-8"))
EXPECTED_MODELS = {
    "process-architecture", "order-to-cash", "procure-to-pay",
    "manufacturing-conversion", "design-services", "payroll",
    "manual-journals-close", "returns-credit-refunds", "cash-application",
    "accrual-settlement", "manufacturing-variances",
}
FLOW_NODES = {
    "task", "subprocess", "start", "messageStart", "messageCatch",
    "timerStart", "end", "exclusive", "parallel",
}
STARTS = {"start", "messageStart", "timerStart"}
ALLOWED_TYPES = FLOW_NODES | {"heading", "pool", "lane", "data", "note"}
SVG = "{http://www.w3.org/2000/svg}"


def model_source(model: dict) -> tuple[ET.Element, dict[str, ET.Element]]:
    source = ET.parse(ASSETS / f"{model['id']}.drawio").getroot()
    return source, {item.attrib["id"]: item for item in source.findall(".//object")}


def cell(item: ET.Element) -> ET.Element:
    value = item.find("mxCell")
    assert value is not None, f"Missing editable cell: {item.attrib}"
    return value


def style(item: ET.Element) -> dict[str, str]:
    return dict(
        part.split("=", 1)
        for part in cell(item).get("style", "").split(";")
        if "=" in part
    )


def pool_for(identifier: str, objects: dict[str, ET.Element]) -> str | None:
    visited = set()
    while identifier in objects:
        assert identifier not in visited, f"Cyclic containment: {identifier}"
        visited.add(identifier)
        item = objects[identifier]
        if item.get("bpmnType") == "pool":
            return identifier
        identifier = cell(item).get("parent", "")
    return None


def sequence_graph(objects: dict[str, ET.Element]):
    outgoing, incoming = defaultdict(list), defaultdict(list)
    for item in objects.values():
        if item.get("flowType") == "sequence":
            edge = cell(item)
            outgoing[edge.get("source")].append(item)
            incoming[edge.get("target")].append(item)
    return outgoing, incoming


def reachable(starts: set[str], graph, endpoint: str) -> set[str]:
    visited, pending = set(starts), list(starts)
    while pending:
        for item in graph[pending.pop()]:
            identifier = cell(item).get(endpoint)
            if identifier not in visited:
                visited.add(identifier)
                pending.append(identifier)
    return visited


def geometry(item: ET.Element) -> tuple[float, float, float, float]:
    value = cell(item).find("mxGeometry")
    assert value is not None, f"Missing editable geometry: {item.attrib}"
    return tuple(float(value.get(name, "0")) for name in ("x", "y", "width", "height"))


def normalized_attributes(item: ET.Element) -> dict[str, str]:
    return {key: html.unescape(value) for key, value in item.attrib.items()}


def test_complete_catalog_has_corresponding_source_and_svg():
    identifiers = [model["id"] for model in MODELS]
    assert len(identifiers) == len(set(identifiers))
    assert set(identifiers) == EXPECTED_MODELS
    for suffix in (".drawio", ".svg"):
        assert {file.stem for file in ASSETS.glob(f"*{suffix}")} == EXPECTED_MODELS
    for model in MODELS:
        assert len(model["alt"]) >= 80
        assert len(model["steps"]) >= 3
        assert model["boundary"]
        assert model["tables"]
        for name in ("processPath", "exercisePath", "casePath"):
            assert model[name].startswith("/docs/")


@pytest.mark.parametrize("model", MODELS, ids=lambda model: model["id"])
def test_sources_remain_editable_native_drawio_models(model):
    source, objects = model_source(model)
    assert source.tag == "mxfile"
    diagrams = source.findall("diagram")
    assert len(diagrams) == 1
    assert diagrams[0].get("id") == model["id"]
    graph = diagrams[0].find("mxGraphModel/root")
    assert graph is not None, "Source must contain editable cells, not a flattened image"
    identifiers = [item.get("id") for item in graph]
    assert None not in identifiers
    assert len(identifiers) == len(set(identifiers))
    assert objects
    for item in objects.values():
        kind = item.get("bpmnType")
        if kind is None:
            assert item.get("flowType") in {"sequence", "message", "association"}
            continue
        assert kind in ALLOWED_TYPES
        cell_style = style(item)
        if kind in {"task", "subprocess"}:
            assert cell_style["shape"] == "mxgraph.bpmn.task2"
            assert cell_style.get("dashed", "0") == "0"
            assert cell_style.get("bpmnShapeType", "task") == "task", "Normal subprocesses need a solid outline"
        elif kind in {"exclusive", "parallel"}:
            assert cell_style["shape"] == "mxgraph.bpmn.gateway2"
            assert cell_style["gwType"] == kind
        elif kind in STARTS | {"end", "messageCatch"}:
            assert cell_style["shape"] == "mxgraph.bpmn.event"
            assert cell_style["outline"] == (
                "end" if kind == "end" else "catching" if kind == "messageCatch" else "standard"
            )
        if kind == "subprocess":
            assert cell_style.get("isLoopSub") == "1", "Collapsed subprocess needs the bottom boxed plus"
            assert item.get("detailModel") in EXPECTED_MODELS


@pytest.mark.parametrize("model", MODELS, ids=lambda model: model["id"])
def test_pool_boundaries_and_connector_notation(model):
    _, objects = model_source(model)
    for identifier, item in objects.items():
        kind = item.get("bpmnType")
        if kind == "lane":
            assert objects[cell(item).get("parent")].get("bpmnType") == "pool"
        if kind in FLOW_NODES:
            owner = pool_for(identifier, objects)
            assert owner, f"Flow node outside a participant: {identifier}"
            assert item.get("participant") == owner
            assert objects[cell(item).get("parent")].get("bpmnType") in {"lane", "subprocess"}
        flow = item.get("flowType")
        if flow not in {"sequence", "message"}:
            continue
        edge = cell(item)
        source_id, target_id = edge.get("source"), edge.get("target")
        assert source_id in objects and target_id in objects
        source_pool = pool_for(source_id, objects)
        target_pool = pool_for(target_id, objects)
        cell_style = style(item)
        assert cell_style["endArrow"] == "blockThin"
        if flow == "sequence":
            assert source_pool is not None and source_pool == target_pool
            assert objects[source_id].get("bpmnType") in FLOW_NODES
            assert objects[target_id].get("bpmnType") in FLOW_NODES
            assert cell_style.get("dashed", "0") == "0"
            assert cell_style.get("startArrow") == "none"
            assert cell_style.get("endFill") == "1"
        else:
            assert source_pool and target_pool and source_pool != target_pool
            for endpoint in (source_id, target_id):
                assert objects[endpoint].get("bpmnType") in {"pool", "task", "subprocess", "messageStart", "messageCatch"}
            assert cell_style.get("dashed") == "1"
            assert cell_style.get("startArrow") == "oval"
            assert cell_style.get("startFill") == "0"
            assert cell_style.get("endFill") == "0"


@pytest.mark.parametrize("model", MODELS, ids=lambda model: model["id"])
def test_sequence_reachability_events_and_gateways(model):
    _, objects = model_source(model)
    outgoing, incoming = sequence_graph(objects)
    nodes = {identifier for identifier, item in objects.items() if item.get("bpmnType") in FLOW_NODES}
    starts = {identifier for identifier in nodes if objects[identifier].get("bpmnType") in STARTS}
    ends = {identifier for identifier in nodes if objects[identifier].get("bpmnType") == "end"}
    assert starts and ends
    assert reachable(starts, outgoing, "target") == nodes, "Every activity must be reachable from a modeled trigger"
    assert reachable(ends, incoming, "source") == nodes, "Every path needs a route to a modeled outcome"
    for identifier in nodes:
        kind = objects[identifier].get("bpmnType")
        if kind in STARTS:
            assert not incoming[identifier]
            assert outgoing[identifier]
        elif kind == "end":
            assert incoming[identifier]
            assert not outgoing[identifier]
        else:
            assert incoming[identifier] and outgoing[identifier]
        if kind in {"exclusive", "parallel"}:
            assert len(incoming[identifier]) > 1 or len(outgoing[identifier]) > 1
        if kind == "exclusive" and len(outgoing[identifier]) > 1:
            labels = [edge.get("label", "").strip() for edge in outgoing[identifier]]
            assert all(labels), f"Exclusive decisions need labeled alternatives: {identifier}"
            assert len(labels) == len(set(labels))
        if kind == "parallel":
            assert not any(edge.get("label", "").strip() for edge in outgoing[identifier]), "Parallel splits have no conditional alternatives"


@pytest.mark.parametrize("model", MODELS, ids=lambda model: model["id"])
def test_nodes_and_event_labels_fit_responsibility_lanes(model):
    _, objects = model_source(model)
    for identifier, item in objects.items():
        if item.get("bpmnType") not in FLOW_NODES:
            continue
        parent = objects[cell(item).get("parent")]
        x, y, width, height = geometry(item)
        _, _, parent_width, parent_height = geometry(parent)
        assert x >= 0 and y >= 0
        assert x + width <= parent_width and y + height <= parent_height, identifier
        parent_style = style(parent)
        if parent.get("bpmnType") == "lane":
            assert x >= float(parent_style.get("startSize", "0")), f"Node overlaps lane heading: {identifier}"
        cell_style = style(item)
        if cell_style.get("verticalLabelPosition") == "bottom":
            assert y + height + 35 <= parent_height, f"Event label crosses lane boundary: {identifier}"


@pytest.mark.parametrize("model", MODELS, ids=lambda model: model["id"])
def test_svg_export_preserves_source_and_safe_accessible_graphics(model):
    source_path = ASSETS / f"{model['id']}.drawio"
    _, objects = model_source(model)
    svg = ET.parse(ASSETS / f"{model['id']}.svg").getroot()
    assert svg.tag == f"{SVG}svg"
    assert svg.get("role") == "img"
    assert svg.find(f"{SVG}title") is not None
    assert svg.find(f"{SVG}desc") is not None
    assert svg.find(f"{SVG}title").text
    assert svg.find(f"{SVG}desc").text
    assert svg.get("data-source-sha256") == hashlib.sha256(source_path.read_bytes()).hexdigest()
    view_box = [float(value) for value in svg.get("viewBox", "").split()]
    assert len(view_box) == 4 and view_box[2] > 0 and view_box[3] > 0
    groups = {item.get("data-cell-id"): item for item in svg.iter() if item.get("data-cell-id")}
    assert set(objects) <= set(groups), "Export must render every editable object"
    for element in svg.iter():
        assert element.tag.rsplit("}", 1)[-1] != "script"
        assert not any(name.lower().startswith("on") for name in element.attrib)
    embedded = ET.fromstring(svg.get("content", ""))
    embedded_objects = {item.attrib["id"]: item for item in embedded.findall(".//object")}
    assert set(embedded_objects) == set(objects)
    for identifier, item in objects.items():
        exported = embedded_objects[identifier]
        assert normalized_attributes(exported) == normalized_attributes(item), identifier
        for name in ("parent", "source", "target"):
            assert cell(exported).get(name) == cell(item).get(name), identifier
        if item.get("bpmnType") in {"task", "subprocess"}:
            shape = next(iter(groups[identifier]))
            outlines = [child for child in shape if child.get("stroke", "none") != "none"]
            assert outlines
            assert not any(child.get("stroke-dasharray") for child in outlines), "Normal activities cannot render as event subprocesses"


def test_table_references_exist_in_local_published_database():
    database = ROOT / "outputs" / "CharlesRiver.sqlite"
    if not database.exists():
        pytest.skip("Published SQLite is unavailable; release claim verification must be run separately")
    with sqlite3.connect(database.resolve().as_uri() + "?mode=ro", uri=True) as connection:
        tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    for model in MODELS:
        assert set(model["tables"]) <= tables, model["id"]
        _, objects = model_source(model)
        for item in objects.values():
            references = {name.strip() for name in item.get("evidenceTables", "").split(",") if name.strip()}
            assert references <= tables, f"Unknown evidence table in {model['id']}: {references - tables}"
