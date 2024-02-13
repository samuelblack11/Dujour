// Driver routes
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).send('Error fetching drivers');
  }
});

app.post('/api/drivers', async (req, res) => {
  const driver = new Driver(req.body);
  try {
    await driver.save();
    res.send('Driver data saved to MongoDB');
  } catch (error) {
    res.status(500).send('Error saving driver data');
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).send('Error updating driver');
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.send('Driver deleted successfully');
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).send('Error deleting driver');
  }
});