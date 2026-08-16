-- Customers
INSERT OR IGNORE INTO customers (id, name, email) VALUES
(1, 'Amina K', 'amina.k@example.com'),
(2, 'John Doe', 'john.doe@example.com');

-- Products
INSERT OR IGNORE INTO products (product_id, name, category, description, price) VALUES
(1, 'Ridgeline Sneaker', 'Footwear', 'Durable trail running sneaker', 120.00),
(2, 'Atlas Trail Jacket', 'Outerwear', 'Waterproof windbreaker jacket', 180.00),
(3, 'Voyager Backpack', 'Accessories', '30L water-resistant backpack', 95.00);

-- Inventory
INSERT OR IGNORE INTO inventory (product_id, size, stock_quantity, stock_status, location) VALUES
(1, 'M', 15, 'In Stock', 'Nairobi Warehouse'),
(1, 'L', 8, 'Low Stock', 'Nairobi Warehouse'),
(2, 'M', 0, 'Out of Stock', 'Nairobi Warehouse'),
(3, 'One Size', 25, 'In Stock', 'Mombasa Depot');

-- Orders
INSERT OR IGNORE INTO orders (order_id, customer_id, status, carrier, estimated_delivery, eta, latest_update, note) VALUES
('NS-10432', 1, 'Shipped', 'G4S Courier', 'Aug 18', 'Aug 18', 'Left Nairobi hub this morning.', 'Left Nairobi hub this morning.'),
('NS-77881', 2, 'Processing', 'DHL Express', 'Aug 20', 'Aug 20', 'Order packed and awaiting carrier pickup.', 'Order packed and awaiting carrier pickup.');

-- Order Items
INSERT OR IGNORE INTO order_items (order_id, product_id, quantity) VALUES
('NS-10432', 1, 1),
('NS-77881', 1, 1);