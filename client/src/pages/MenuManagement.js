import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllPages.css';
import { GenericTable, GenericPopup } from './ReusableReactComponents';
//import ItemForm from './ItemForm'; // Assuming ItemForm and FarmForm are separated into their own files
//import FarmForm from './FarmForm';

const ItemForm = ({ item, onSave, farms }) => {
  // Initialize form state with item data if editing, or blank for adding
  const [formState, setFormState] = useState({
    itemName: item ? item.itemName : '',
    unitCost: item ? item.unitCost : '',
    quantityAvailable: item ? item.quantityAvailable : '',
    farm: item && item.farm ? item.farm._id : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call to add or update item
    try {
      if (item) {
        console.log("Submitting form with data:", formState);
        await axios.put(`/api/items/${item._id}`, formState);
      } else {
        await axios.post('/api/items', formState);
        console.log("POST COMPLETE")
      }
      onSave(); // Trigger fetching items and closing popup
    } catch (error) {
      console.error('Failed to save item:', error);
      // Handle error (show message to user, etc.)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="itemName">Item Name:</label>
      <input
        id="itemName"
        name="itemName"
        type="text"
        value={formState.itemName}
        onChange={handleChange}
        required
      />
      <label htmlFor="unitCost">Unit Cost:</label>
      <input
        id="unitCost"
        name="unitCost"
        type="number"
        value={formState.unitCost}
        onChange={handleChange}
        required
      />
      <label htmlFor="quantityAvailable">Quantity Available:</label>
      <input
        id="quantityAvailable"
        name="quantityAvailable"
        type="number"
        value={formState.quantityAvailable}
        onChange={handleChange}
        required
      />

      <label htmlFor="farm">Farm:</label>
      <select
        id="farm"
        name="farm"
        value={formState.farm}
        onChange={handleChange}
        required
      >
        <option value="">Select a farm</option>
        {farms.map(farm => (
          <option key={farm._id} value={farm._id}>{farm.name}</option>
        ))}
      </select>

      <button type="submit" className="add-button">Save Item</button>
    </form>
  );
};

const FarmForm = ({ farm, onSave }) => {
  const [formState, setFormState] = useState({
    name: farm ? farm.name : '',
    address: farm ? farm.address : '',
    contactNumber: farm ? farm.contactNumber : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call to add or update farm
    try {
      if (farm) {
        await axios.put(`/api/farms/${farm._id}`, formState);
      } else {
        await axios.post('/api/farms', formState);
      }
      onSave(); // Trigger fetching farms and closing popup
    } catch (error) {
      console.error('Failed to save farm:', error);
      // Handle error (show message to user, etc.)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Farm Name:</label>
      <input
        id="name"
        name="name"
        type="text"
        value={formState.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="address">Address:</label>
      <input
        id="address"
        name="address"
        type="text"
        value={formState.address}
        onChange={handleChange}
        required
      />

      <label htmlFor="contactNumber">Contact Number:</label>
      <input
        id="contactNumber"
        name="contactNumber"
        type="text"
        value={formState.contactNumber}
        onChange={handleChange}
      />

      <button type="submit">Save Farm</button>
    </form>
  );
};

const MenuManagement = () => {
    const [items, setItems] = useState([]);
    const [farms, setFarms] = useState([]);
    const [showItemPopup, setShowItemPopup] = useState(false);
    const [showFarmPopup, setShowFarmPopup] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // null for adding, object for editing
    const [currentFarm, setCurrentFarm] = useState(null);

    const columns = [
  {
    Header: 'Item Name',
    accessor: 'itemName', // The key from the item data
  },
    {
    Header: 'Unit Cost',
    accessor: 'unitCost', // The key from the item data
  },
  {
    Header: 'Farm',
    Cell: ({ row }) => row.farm.name
  },
  {
    Header: 'Quantity Available',
    accessor: 'quantityAvailable',
  },
  {
    Header: 'Actions',
    accessor: 'actions',
    Cell: ({ row }) => (
      <>
        <button onClick={() => handleAddEditItem(row)} className="edit-btn">Edit</button>
        <button onClick={() => handleDeleteItem(row._id)} className="delete-btn">Delete</button>
      </>
    ),
  }
];

    useEffect(() => {
        fetchItems();
        fetchFarms();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('/api/items');
            console.log("Fetched Items:", response.data); // Inspect the fetched data
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    };

    const fetchFarms = async () => {
        try {
            const response = await axios.get('/api/farms');
            setFarms(response.data);
        } catch (error) {
            console.error('Failed to fetch farms:', error);
        }
    };

    const handleAddEditItem = (item = null) => {
        setCurrentItem(item); // Set currentItem for editing, null for adding
        setShowItemPopup(true);
    };

    const handleAddEditFarm = (farm = null) => {
        setCurrentFarm(farm); // Set currentFarm for editing, null for adding
        setShowFarmPopup(true);
    };

    const handleCloseItemPopup = () => {
        setShowItemPopup(false);
        setCurrentItem(null); // Reset after closing
        fetchItems(); // Refresh items list
    };

    const handleCloseFarmPopup = () => {
        setShowFarmPopup(false);
        setCurrentFarm(null); // Reset after closing
        fetchFarms(); // Refresh farms list
    };

    const handleDeleteItem = async (id) => {
        try {
            console.log(`Deleting item with id: ${id}`);
            await axios.delete(`/api/items/${id}`);
            fetchItems(); // Refresh items list after deletion
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const handleDeleteFarm = async (id) => {
        try {
            await axios.delete(`/api/farms/${id}`);
            fetchFarms(); // Refresh farms list after deletion
        } catch (error) {
            console.error('Failed to delete farm:', error);
        }
    };
    return (
        <div className="menu-management-container">
        <h3 class="page-header">Menu Management</h3>
        <div className="button-group">
            <button onClick={() => handleAddEditItem()} className="add-button">Add Menu Item</button>
            <button onClick={() => handleAddEditFarm()} className="add-button">Add Farm</button>
            </div>
            {showItemPopup && (
                <GenericPopup show={showItemPopup} onClose={handleCloseItemPopup}>
                    <ItemForm item={currentItem} farms={farms} onSave={handleCloseItemPopup} />
                </GenericPopup>
            )}

            {showFarmPopup && (
                <GenericPopup show={showFarmPopup} onClose={handleCloseFarmPopup}>
                    <FarmForm farm={currentFarm} onSave={handleCloseFarmPopup} />
                </GenericPopup>
            )}

            <div className="menu-items-table">
            <h3>Available Items</h3>
            <GenericTable 
                data={items} 
                columns={columns} 
                handleEditClick={handleAddEditItem} 
                deleteCargo={handleDeleteItem} 
                />
            </div>
        </div>
    );
};
export default MenuManagement;
