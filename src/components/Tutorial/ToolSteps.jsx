import Tabs from "@theme/Tabs";

export default function ToolSteps({ children }) {
  return <Tabs groupId="tutorial-tool" queryString="tool" defaultValue="excel" values={[{ value: "excel", label: "Excel" }, { value: "sql", label: "SQL" }]}>{children}</Tabs>;
}
