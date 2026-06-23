"use client";

import { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2, Check, Loader2, Tag, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminPricing() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      setCategories(data.categories || []);
    } finally {
      setLoading(false);
    }
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      await fetch("/api/admin/pricing/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      setNewCategoryName("");
      setShowAddCategory(false);
      loadData();
    } finally {
      setSavingCategory(false);
    }
  }

  function openNewItem(categoryId) {
    setEditingItem({
      categoryId, name: "", price: "", priceSuffix: "",
      createServicePage: false, serviceCategory: "", serviceSummary: "",
    });
  }

  function openEditItem(item, categoryId) {
    setEditingItem({
      ...item,
      price: Number(item.price).toFixed(2),
      categoryId,
      createServicePage: item.hasServicePage || false,
    });
  }

  async function saveItem() {
    const res = await fetch("/api/admin/pricing/items", {
      method: editingItem.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    });
    if (res.ok) { setEditingItem(null); loadData(); }
  }

  async function deleteItem(itemId) {
    if (!confirm("Remove this item from prices and services?")) return;
    await fetch(`/api/admin/pricing/items/${itemId}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F7FAFC", minHeight: "100vh" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#142433" }}>Prices & Services</h1>
            <p style={{ fontSize: 13, color: "#7C93A6", marginTop: 2 }}>
              Adding an item here lists it on Our Prices. Tick &quot;Also list on Services&quot; to add it there too.
            </p>
          </div>
          <button onClick={() => setShowAddCategory(true)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "#142433", color: "#fff",
            border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
            <Plus size={15} /> New Category
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A6478", padding: "20px 0" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, textAlign: "center", color: "#7C93A6", fontSize: 14 }}>
            No price categories yet. Click &quot;New Category&quot; to add one, or run <code>npm run seed:prices</code> to load the default price list.
          </div>
        )}

        {categories.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#142433" }}>{cat.name}</h2>
              <button onClick={() => openNewItem(cat.id)} style={{
                display: "flex", alignItems: "center", gap: 5, background: "none",
                border: "1px solid #DCEAF3", borderRadius: 8, padding: "6px 12px",
                fontSize: 12.5, fontWeight: 700, color: "#2F7FB3", cursor: "pointer",
              }}>
                <Plus size={14} /> Add item
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E3EEF5", overflow: "hidden" }}>
              {cat.items.length === 0 && (
                <div style={{ padding: 16, fontSize: 13.5, color: "#9CB0BF" }}>No items yet — click &quot;Add item&quot; above.</div>
              )}
              {cat.items.map((item, i) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  padding: "14px 18px", borderBottom: i < cat.items.length - 1 ? "1px solid #F2F8FC" : "none",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: "#142433" }}>{item.name}</span>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: "#2F7FB3" }}>
                        £{Number(item.price).toFixed(2)}{item.priceSuffix || ""}
                      </span>
                      {item.hasServicePage && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
                          color: "#1F7A45", background: "#E9F6EE", padding: "2px 8px", borderRadius: 999,
                        }}>
                          <Tag size={10} /> On Services
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => openEditItem(item, cat.id)} style={{
                      background: "none", border: "1px solid #DCEAF3", borderRadius: 8, width: 32, height: 32,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <Pencil size={14} color="#4A6478" />
                    </button>
                    <button onClick={() => deleteItem(item.id)} style={{
                      background: "none", border: "1px solid #DCEAF3", borderRadius: 8, width: 32, height: 32,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <Trash2 size={14} color="#B3261E" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Add Category Modal ===== */}
      {showAddCategory && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,36,51,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 380 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#142433" }}>New Category</h2>
              <button onClick={() => setShowAddCategory(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#7C93A6" />
              </button>
            </div>
            <label>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>Category name</span>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                placeholder="e.g. Orthodontics"
                autoFocus
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14, marginBottom: 14 }}
              />
            </label>
            <button onClick={addCategory} disabled={savingCategory || !newCategoryName.trim()} style={{
              width: "100%", background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 10,
              padding: "12px", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {savingCategory ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={15} />}
              {savingCategory ? "Saving…" : "Add Category"}
            </button>
          </div>
        </div>
      )}

      {/* ===== Edit/Add Item Modal ===== */}
      {editingItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,36,51,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#142433" }}>
                {editingItem.id ? "Edit Item" : "New Item"}
              </h2>
              <button onClick={() => setEditingItem(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#7C93A6" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <LabeledInput label="Treatment name" value={editingItem.name} onChange={(v) => setEditingItem({ ...editingItem, name: v })} placeholder="e.g. Teeth Whitening" />
              <div style={{ display: "flex", gap: 10 }}>
                <LabeledInput label="Price (£)" value={editingItem.price} onChange={(v) => setEditingItem({ ...editingItem, price: v })} placeholder="375.00" type="number" />
                <LabeledInput label='Suffix (e.g. "+")' value={editingItem.priceSuffix} onChange={(v) => setEditingItem({ ...editingItem, priceSuffix: v })} placeholder="optional" />
              </div>

              <div style={{ borderTop: "1px solid #E3EEF5", paddingTop: 14 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={editingItem.createServicePage}
                    onChange={(e) => setEditingItem({ ...editingItem, createServicePage: e.target.checked })} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#142433" }}>Also list this on Our Services</span>
                </label>
                {editingItem.createServicePage && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <LabeledInput label="Service category" value={editingItem.serviceCategory}
                      onChange={(v) => setEditingItem({ ...editingItem, serviceCategory: v })} placeholder="e.g. Cosmetic Dentistry" />
                    <label style={{ display: "block" }}>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>
                        Short description (shown on the service card)
                      </span>
                      <textarea rows={3} value={editingItem.serviceSummary}
                        onChange={(e) => setEditingItem({ ...editingItem, serviceSummary: e.target.value })}
                        placeholder="One or two sentences a patient would find helpful…"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 13.5, fontFamily: "inherit", resize: "vertical" }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button onClick={saveItem} style={{
              width: "100%", background: "#2F7FB3", color: "#fff", border: "none", borderRadius: 10,
              padding: "13px", fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginTop: 18,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Check size={16} /> Save
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "block", flex: 1 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#4A6478", marginBottom: 6 }}>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #DCEAF3", fontSize: 14 }} />
    </label>
  );
}
