import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import styles from "./Inventory.module.css";

type InventoryItem = {
  item_id: string;
  name: string;
  image_url: string;
  quantity: number;
  rarity: string;
};

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const { user } = useUser();
  React.useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`/api/inventory?userId=${user?.userId}`);
        const data = await res.json();
        setInventory(data.items || []);
      } catch (err) {
        console.error("Ошибка загрузки инвентаря:", err);
      }
    };

    if (user?.userId) {
      fetchInventory();
    }
  }, [user]);
  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🎒 Инвентарь</h2>
        <div className={styles.inventoryGrid}>
          {inventory.length === 0 ? (
            <p>У вас пока нет предметов.</p>
          ) : (
            inventory.map((item) => (
              <div key={item.item_id} className={styles.itemCard}>
                <img
                  src={`/materials/${item.image_url}`}
                  alt={item.name}
                  className={styles.itemIcon}
                />
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemQty}>×{item.quantity}</div>
                  <div
                    className={styles.itemRarity}
                    data-rarity={item.rarity.toLowerCase()}
                  >
                    {item.rarity}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
