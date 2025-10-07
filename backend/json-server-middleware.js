module.exports = (req, res, next) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  // Add request logging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Add custom ID generation for POST requests
  if (req.method === 'POST' && req.body) {
    const generateId = (prefix, existingItems = []) => {
      const year = new Date().getFullYear();
      const numbers = existingItems
        .map(item => {
          const match = item.id?.match(new RegExp(`${prefix}-${year}-(\\d+)`));
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
      return `${prefix}-${year}-${nextNumber.toString().padStart(3, '0')}`;
    };

    // Auto-generate IDs based on endpoint
    if (req.url.includes('/binding-advices') && !req.body.id) {
      req.body.id = generateId('BA');
    } else if (req.url.includes('/job-cards') && !req.body.id) {
      req.body.id = generateId('JC');
    } else if (req.url.includes('/inventory') && !req.body.id) {
      req.body.id = generateId('INV');
    } else if (req.url.includes('/dispatches') && !req.body.id) {
      req.body.id = generateId('DC');
    } else if (req.url.includes('/invoices') && !req.body.id) {
      req.body.id = generateId('INV');
    } else if (req.url.includes('/clients') && !req.body.id) {
      req.body.id = generateId('CL');
    } else if (req.url.includes('/paper-sizes') && !req.body.id) {
      req.body.id = generateId('PS');
    } else if (req.url.includes('/notebook-types') && !req.body.id) {
      req.body.id = generateId('NT');
    } else if (req.url.includes('/calculation-rules') && !req.body.id) {
      req.body.id = generateId('CR');
    } else if (req.url.includes('/teams') && !req.body.id) {
      req.body.id = generateId('TM');
    } else if (req.url.includes('/users') && !req.body.id) {
      req.body.id = generateId('USR');
    } else if (req.url.includes('/roles') && !req.body.id) {
      req.body.id = generateId('ROLE');
    } else if (req.url.includes('/system-settings') && !req.body.id) {
      req.body.id = generateId('SET');
    }

    // Add timestamps
    if (req.method === 'POST') {
      req.body.createdDate = req.body.createdDate || new Date().toISOString().split('T')[0];
      req.body.lastUpdated = new Date().toISOString().split('T')[0];
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      req.body.lastUpdated = new Date().toISOString().split('T')[0];
    }
  }

  next();
};
