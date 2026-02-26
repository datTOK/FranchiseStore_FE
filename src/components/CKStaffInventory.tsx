import React from "react";

export type InventoryItem = {
  id: number;
  sku: string;
  name: string;
  type: string;
  category_name: string;
  qty: number;
  status: "Active" | "Inactive";
};

export type InventoryLog = {
  id: string;
  type: "Import" | "Export";
  itemName: string;
  quantity: number;
  date: string;
  performer: string;
  referenceDoc: string;
};

type Props = {
  inventory: InventoryItem[];
  logs: InventoryLog[];
  activeTab: "inventory" | "history";
  setActiveTab: React.Dispatch<React.SetStateAction<"inventory" | "history">>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterType: any;
  setFilterType: React.Dispatch<React.SetStateAction<any>>;
  totalItems: number;
  activeItems: number;
  rawMaterialCount: number;
};

function getTypeLabel(type: string) {
  switch (type) {
    case "FINISHED":
      return "Finished Product";
    case "RAW_MATERIAL":
      return "Raw Material";
    case "SEMI_FINISHED":
      return "Semi-Finished Product";
    default:
      return type;
  }
}

export default function StaffInventoryTable(props: Props) {
  const {
    inventory,
    logs,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    totalItems,
    activeItems,
    rawMaterialCount,
  } = props;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <Card title="Total Items" value={totalItems} sub="Total items in stock" />
        <Card title="Active Items" value={activeItems} sub="Items with Active status" />
        <Card title="Raw Material" value={rawMaterialCount} sub="Number of raw materials" />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
          <Tab active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")}>
            Inventory List
          </Tab>
          <Tab active={activeTab === "history"} onClick={() => setActiveTab("history")}>
            Stock History
          </Tab>

          <div style={{ flex: 1 }} />

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, Name..."
            style={{
              height: 40,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              width: 280,
            }}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              height: 40,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              minWidth: 180,
            }}
          >
            <option value="All">All Types</option>
            <option value="RAW_MATERIAL">Raw Material</option>
            <option value="SEMI_FINISHED">Semi-Finished Product</option>
            <option value="FINISHED">Finished Product</option>
          </select>
        </div>

        {activeTab === "inventory" ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f6f7fb" }}>
                  <Th>ID</Th>
                  <Th>SKU & Name</Th>
                  <Th>Type</Th>
                  <Th>category_name</Th>
                  <Th>Qty</Th>
                  <Th>Status</Th>
                  <Th style={{ textAlign: "right" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((x) => (
                  <tr key={x.id} style={{ borderTop: "1px solid #eee" }}>
                    <Td>{x.id}</Td>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{x.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{x.sku}</div>
                    </Td>
                    <Td>{getTypeLabel(x.type)}</Td>
                    <Td>{x.category_name}</Td>
                    <Td>{x.qty}</Td>
                    <Td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          border: "1px solid #ddd",
                          background: x.status === "Active" ? "#e9fff2" : "#fff2f2",
                        }}
                      >
                        {x.status}
                      </span>
                    </Td>
                    <Td style={{ textAlign: "right" }}>
                      <button
                        style={{
                          border: "1px solid #ddd",
                          background: "#fff",
                          borderRadius: 10,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                        onClick={() => alert("Edit: " + x.id)}
                      >
                        ✏️
                      </button>
                    </Td>
                  </tr>
                ))}

                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.7 }}>
                      No data
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f6f7fb" }}>
                  <Th>ID</Th>
                  <Th>Type</Th>
                  <Th>Item</Th>
                  <Th>Qty</Th>
                  <Th>Date</Th>
                  <Th>Performer</Th>
                  <Th>Ref</Th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} style={{ borderTop: "1px solid #eee" }}>
                    <Td>{l.id}</Td>
                    <Td>{l.type}</Td>
                    <Td>{l.itemName}</Td>
                    <Td>{l.quantity}</Td>
                    <Td>{l.date}</Td>
                    <Td>{l.performer}</Td>
                    <Td>{l.referenceDoc}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card(props: { title: string; value: number; sub: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 12, background: "#fff", minWidth: 240 }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>{props.title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{props.value}</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{props.sub}</div>
    </div>
  );
}

function Tab(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontWeight: props.active ? 700 : 500,
        color: props.active ? "#f97316" : "#555",
      }}
    >
      {props.children}
    </button>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} style={{ textAlign: "left", padding: 12, fontSize: 13, color: "#111" }} />;
}

function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} style={{ padding: 12, verticalAlign: "top" }} />;
}