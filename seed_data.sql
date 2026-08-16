-- Customers
INSERT INTO customers (id, name, email) VALUES
(1, 'Amina K', 'amina.k@example.com'),
(2, 'John Doe', 'john.doe@example.com');

-- Products
INSERT INTO products (id, name, category, description, price) VALUES
(1, 'Ridgeline Sneaker', 'Footwear', 'Durable trail running sneaker', 120.00),
(2, 'Atlas Trail Jacket', 'Outerwear', 'Waterproof windbreaker jacket', 180.00),
(3, 'Voyager Backpack', 'Accessories', '30L water-resistant backpack', 95.00);

-- Inventory
INSERT INTO inventory (product_id, size, stock_quantity, location) VALUES
(1, 'M', 15, 'Nairobi Warehouse'),
(1, 'L', 8, 'Nairobi Warehouse'),
(2, 'M', 0, 'Nairobi Warehouse'),
(3, 'One Size', 25, 'Mombasa Depot');

-- Orders
INSERT INTO orders (order_id, customer_id, status, carrier, estimated_delivery, latest_update) VALUES
('NS-10432', 1, 'Shipped', 'G4S Courier', 'Aug 18', 'Left Nairobi hub this morning.'),
('NS-77881', 2, 'Processing', 'DHL Express', 'Aug 20', 'Order packed and awaiting carrier pickup.');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity) VALUES
('NS-10432', 1, 1), -- Amina bought Ridgeline Sneaker
('NS-77881', 1, 1); -- John also bought Ridgeline Sneaker