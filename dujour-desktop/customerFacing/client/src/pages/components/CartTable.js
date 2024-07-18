import React from 'react';

const CartTable = ({ cartItems, availableItems, inputQuantities, updatingItems, setInputQuantities, confirmUpdate, toggleItemUpdate, removeFromCart }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Line Item Cost</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {cartItems.map((item) => {
                    const inventoryItem = availableItems.find(ai => ai._id === item._id); // Ensure 'item' is properly scoped
                    const maxQuantity = inventoryItem ? inventoryItem.quantityAvailable : 1; // Default to 1 if not found
                    console.log(maxQuantity)
                    return (
                        <tr key={item._id}>
                            <td>{item.itemName}</td>
                            <td>
                                {item.isUpdating ? (
                                    <input
                                        type="number"
                                        min="1"
                                        max={maxQuantity}
                                        value={inputQuantities[item._id] || item.quantity}
                                        onChange={e => {
                                            const newValue = Math.min(maxQuantity, Math.max(1, parseInt(e.target.value, 10)));
                                            if (!isNaN(newValue)) { // Check if the newValue is a number
                                                setInputQuantities(item._id, newValue);
                                            }
                                        }}
                                        className="mini-cart-quantity-input"
                                    />
                                ) : (
                                    item.quantity
                                )}
                            </td>
                            <td>${item.unitCost.toFixed(2)}</td>
                            <td>${(item.quantity * item.unitCost).toFixed(2)}</td>
                            <td>
                                {item.isUpdating ? (
                                    <button className="add-button" onClick={() => confirmUpdate(item._id)}>
                                        Confirm
                                    </button>
                                ) : (
                                    <button className="add-button" onClick={() => toggleItemUpdate(item._id)}>
                                        Update
                                    </button>
                                )}
                                <button className="delete-btn" onClick={() => removeFromCart(item._id)}>Delete</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default CartTable;
