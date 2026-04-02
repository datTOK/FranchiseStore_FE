import React from "react";


export type InventoryItem = {
  id: number;
  sku: string;
  name: string;
  type: string;
  category_name: string;
  qty: number;
  status: "In stock" | "Low stock" | "Out of stock";
};



type Props = {
  inventory: InventoryItem[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalItems: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
};



export default function StaffInventoryTable(props: Props) {
  const {
  inventory,
  searchTerm,
  setSearchTerm,
  totalItems,
  inStockCount,
  lowStockCount,
  outOfStockCount,
} = props;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <Card title="Total Items" value={totalItems} sub="All items" />
<Card title="In stock" value={inStockCount} sub="Qty > 10" />
<Card title="Low stock" value={lowStockCount} sub="Qty 1 - 10" />
<Card title="Out of stock" value={outOfStockCount} sub="Qty = 0" />

      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Inventory List</div>

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

          
        </div>

        
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f6f7fb" }}>
                  <Th>ID</Th>
                  <Th>SKU & Name</Th>
                  
                  <Th>category_name</Th>
                  <Th>Qty</Th>
                  <Th>Status</Th>
                  {/* <Th style={{ textAlign: "right" }}>Actions</Th> */}
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
                    
                    <Td>{x.category_name}</Td>
                    <Td>{x.qty}</Td>
                    <Td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          border: "1px solid #ddd",
                          background:
  x.status === "In stock"
    ? "#e9fff2"
    : x.status === "Low stock"
    ? "#fff7e6"
    : "#fff2f2",
                        }}
                      >
                        {x.status}
                      </span>
                    </Td>
                 {/*
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
*/}
                  </tr>
                ))}

                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                      No data
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        
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



function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} style={{ textAlign: "left", padding: 12, fontSize: 13, color: "#111" }} />;
}

function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} style={{ padding: 12, verticalAlign: "top" }} />;
}
