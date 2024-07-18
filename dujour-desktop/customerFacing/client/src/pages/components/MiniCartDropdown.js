import React, { useEffect, useRef, useContext, useState } from 'react';
import { useCart } from '../../context/CartContext'; // Adjust the path as needed
import CartTable from './CartTable'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MiniCartDropdown() {
  const { cartItems, updateCartItem, removeFromCart, toggleItemUpdate } = useCart();
  const navigate = useNavigate();
  const [availableItems, setAvailableItems] = useState([]);

useEffect(() => {
    const fetchAvailableItems = async () => {
        try {
            const response = await axios.get('/api/items');
            console.log(response.data)
            setAvailableItems(response.data);
        } catch (error) {
            console.error("Error fetching items:", error);
            setAvailableItems([]); // Set as an empty array on error
        }
    };
    fetchAvailableItems();
}, []);


  return (
    <div className="mini-cart-dropdown">
      {cartItems.length > 0 ? (
        <div>
          <CartTable
            cartItems={cartItems}
            availableItems={availableItems}
            inputQuantities={cartItems.reduce((acc, item) => ({ ...acc, [item._id]: item.quantity.toString() }), {})}
            setInputQuantities={(id, value) => {
              updateCartItem(id, Number(value) || 0); // This updates directly without needing a separate state
            }}
            confirmUpdate={(id) => toggleItemUpdate(id)}
            toggleItemUpdate={toggleItemUpdate}
            removeFromCart={removeFromCart}
          />
          <div className="mini-cart-footer">
            <p>Total: ${cartItems.reduce((total, item) => total + item.quantity * item.unitCost, 0).toFixed(2)}</p>
            <button onClick={() => navigate('/place-order')} className="add-button">Checkout</button>
          </div>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}

export default MiniCartDropdown;
