import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import './AllPages.css';
import { GenericTable, GenericPopup } from './ReusableReactComponents';

const ItemForm = ({ item, onSave }) => {
    const { user } = useContext(AuthContext); // Access the user context
  const [formState, setFormState] = useState({
    itemName: item ? item.itemName : '',
    unitCost: item ? item.unitCost : '',
    originalQuantity: item ? item.originalQuantity : '',
    quantityAvailable: item ? item.quantityAvailable : '',
    farmName: user.role !== 'admin' ? user.name : '', // Autofill if not an admin
  });

    const [farmId, setFarmId] = useState('');
    const getNextSaturday = (currentDate) => {
    const date = new Date(currentDate);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 5 || dayOfWeek === 6) {
        // If today is Friday or Saturday, add enough days to reach the next week's Saturday
        date.setDate(date.getDate() + (13 - dayOfWeek));
    } else {
        // Otherwise, just find the next Saturday
        date.setDate(date.getDate() + (6 - dayOfWeek));
    }

    // Format and return the date as "MM/dd/yyyy"
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name)
    setFormState(prevState => ({
         ...prevState,
         [name]: value,
        originalQuantity: name === 'quantityAvailable' ? value : prevState.originalQuantity
        }));
    //if (name === 'farmName' && user.role === 'admin') {
    //    console.log("fetchFarmId called...")
    //  fetchFarmId(value);
    //}
  };

  useEffect(() => {
    if (user.role !== 'admin') {
      // For non-admin users, auto-set the farm on item creation
      fetchFarmId(user.name);
    }
  }, [user]);

const fetchFarmId = async (name) => {
    if (!name) return null;  // Return null or appropriate default
    try {
        const response = await axios.get(`/api/farms/byname/${encodeURIComponent(name)}`);
        const farm = response.data;
        setFarmId(farm._id);  // Update state as well for future use
        return farm._id;  // Return this for immediate use
    } catch (error) {
        console.error('Failed to find farm:', error);
        setFarmId('');
        return '';  // Return empty string or appropriate default
    }
};


  useEffect(() => {
    if (item) {
      setFormState({
        itemName: item.itemName,
        unitCost: item.unitCost,
        quantityAvailable: item.quantityAvailable,
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let effectiveFarmId = farmId;
    if (user.role === 'admin' && formState.farmName) {
        effectiveFarmId = await fetchFarmId(formState.farmName) || farmId;  // Update currentFarmId if fetched
    }

    console.log("Effective FARM ID: ", effectiveFarmId);

    try {
      const itemData = {
        ...formState,
        farm: effectiveFarmId, // Make sure farmId is explicitly included
        originalQuantity: formState.quantityAvailable,
        forDeliveryOn: new Date(getNextSaturday(new Date())),
        activeStatus: false
      };

      const apiPath = item ? `/api/items/${item._id}` : '/api/items';
      const method = item ? axios.put : axios.post;
      await method(apiPath, itemData);
      onSave(); // Refresh items after saving
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="itemName">Item Name:</label>
      <input id="itemName" name="itemName" type="text" value={formState.itemName} onChange={handleChange} required />
      <label htmlFor="unitCost">Unit Cost:</label>
      <input id="unitCost" name="unitCost" type="number" value={formState.unitCost} onChange={handleChange} required />
      <label htmlFor="quantityAvailable">Quantity Available:</label>
      <input id="quantityAvailable" name="quantityAvailable" type="number" value={formState.quantityAvailable} onChange={handleChange} required />
        {user.role === 'admin' && (
        <>
        <label htmlFor="farmName">Farm Name:</label>
        <input id="farmName" name="farmName" type="text" value={formState.farmName} onChange={handleChange} required />
        </>
        )}
      <button type="submit" className="add-button">Save Item</button>
    </form>
  );
};

const SubmitMenu = () => {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [showItemPopup, setShowItemPopup] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [farms, setFarms] = useState([]);

    useEffect(() => {
        fetchItems();
    }, [farms]);

    useEffect(() => {
        console.log('Items state updated:', items); // Log when items state updates
    }, [items]);


const fetchItems = async () => {
    console.log('Fetching items and farms...');
    try {
        const itemsResponse = await axios.get('/api/items');
        const farmsResponse = await axios.get('/api/farms');
        console.log('Farms:', farmsResponse.data); // Check what farms data looks like
        const farms = farmsResponse.data;

        const farmMap = new Map(farms.map(farm => [farm._id, farm.name]));
        console.log('Farm Map:', farmMap); // Verify farm map

        const nextSaturday = getNextSaturday(new Date());

        let filteredItems = itemsResponse.data.map(item => {
            return {
                ...item,
                farmName: farmMap.get(item.farm._id) || 'No Farm Assigned'
            };
        });

        console.log('Items before final filter:', filteredItems); // Check items before filtering based on role

        filteredItems = filteredItems.filter(item => {
            const deliveryDate = new Date(item.forDeliveryOn);
            const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit'
            });
            const isDateMatch = formattedDeliveryDate === nextSaturday;
            const isFarmMatch = (user.role === 'admin' || item.farmName === user.name);
            console.log(`Item: ${item.itemName}, Date Match: ${isDateMatch}, Farm Match: ${isFarmMatch}`); // Log the check
            return isDateMatch && isFarmMatch;
        });

        setItems(filteredItems);
    } catch (error) {
        console.error('Failed to fetch items or farms:', error);
    }
};




    const handleAddEditItem = (item = null) => {
        setCurrentItem(item);
        setShowItemPopup(true);
    };

    const handleCloseItemPopup = () => {
        setShowItemPopup(false);
        setCurrentItem(null);
        fetchItems();
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`/api/items/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const columns = [
        { Header: 'Item Name', accessor: 'itemName' },
        { Header: 'Unit Cost', accessor: 'unitCost' },
        { Header: 'Original Quantity', accessor: 'originalQuantity' },
        { Header: 'Quantity Available', accessor: 'quantityAvailable' },
        { Header: 'Active', accessor: 'activeStatus', Cell: ({ row }) => row.activeStatus ? 'Yes' : 'No' },
        ...(user.role === 'admin' ? [{ Header: 'Farm Name', accessor: 'farmName' }] : []),
        { Header: 'Actions', Cell: ({ row }) => (
        <>
            <button onClick={() => handleAddEditItem(row)} className="edit-btn" disabled={row.activeStatus}>Edit</button>
            <button onClick={() => handleDeleteItem(row._id)} className="delete-btn" disabled={row.activeStatus}>Delete</button>
        </>
        )}
    ];


const getNextSaturday = (currentDate) => {
    const date = new Date(currentDate);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 5 || dayOfWeek === 6) {
        // If today is Friday or Saturday, add enough days to reach the next week's Saturday
        date.setDate(date.getDate() + (13 - dayOfWeek));
    } else {
        // Otherwise, just find the next Saturday
        date.setDate(date.getDate() + (6 - dayOfWeek));
    }

    // Format and return the date as "MM/dd/yyyy"
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

    return (
        <div className="menu-management-container">
            <h3>Weekly Menu Submission for {user.name}</h3>
            <h4>For Delivery On: {getNextSaturday(new Date())}</h4>
            <button onClick={() => handleAddEditItem()} className="add-button">Add New Menu Item</button>
            {showItemPopup && (
                <GenericPopup show={showItemPopup} onClose={handleCloseItemPopup}>
                    <ItemForm item={currentItem} onSave={handleCloseItemPopup} />
                </GenericPopup>
            )}
            <div className="menu-items-table">
                <GenericTable data={items} columns={columns} />
            </div>
        </div>
    );
};

export default SubmitMenu;
