CREATE DATABASE IF NOT EXISTS transacttrack;
USE transacttrack;


-- ── TABLE 1: users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTO_INCREMENT,
    username TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL,
    role     TEXT    NOT NULL DEFAULT 'staff',
    created  TEXT    NOT NULL DEFAULT (CURDATE())
);

INSERT INTO users (username, password, role) VALUES
    ('admin', 'admin123', 'admin'),
    ('staff', 'staff123', 'staff');


-- ── TABLE 2: regions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS regions (
    id   INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT    NOT NULL UNIQUE
);

INSERT INTO regions (name) VALUES
    ('North'),
    ('South'),
    ('East'),
    ('West');


-- ── TABLE 3: customers ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
    id        INTEGER PRIMARY KEY AUTO_INCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    phone     TEXT,
    region_id INTEGER NOT NULL,
    joined    TEXT    NOT NULL DEFAULT (CURDATE()),
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

INSERT INTO customers (name, email, phone, region_id, joined) VALUES
    ('Maria Santos',    'maria@email.com',  '09171234567', 1, '2024-01-10'),
    ('Juan dela Cruz',  'juan@email.com',   '09182345678', 2, '2024-02-15'),
    ('Ana Reyes',       'ana@email.com',    '09193456789', 3, '2024-03-20'),
    ('Carlos Bautista', 'carlos@email.com', '09204567890', 4, '2024-04-05'),
    ('Liza Gonzales',   'liza@email.com',   '09215678901', 1, '2024-05-12'),
    ('Pedro Ramos',     'pedro@email.com',  '09226789012', 2, '2024-06-01');


-- ── TABLE 4: categories ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT
);

INSERT INTO categories (name, description) VALUES
    ('Purchase',     'Direct product purchase'),
    ('Refund',       'Money returned to customer'),
    ('Subscription', 'Recurring plan payment'),
    ('Service',      'Service fee');


-- ── TABLE 5: transactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    customer_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount      REAL    NOT NULL CHECK (amount > 0),
    status      TEXT    NOT NULL DEFAULT 'Pending',
    date        TEXT    NOT NULL,
    note        TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO transactions (customer_id, category_id, amount, status, date, note) VALUES
    (1, 1, 1500.00, 'Completed', '2025-01-05', 'Grocery items'),
    (2, 3, 3200.00, 'Completed', '2025-01-10', 'Annual plan'),
    (1, 4,  850.00, 'Pending',   '2025-01-15', 'Repair service'),
    (3, 1, 4700.00, 'Completed', '2025-02-01', 'Electronics'),
    (4, 1, 2100.00, 'Failed',    '2025-02-08', 'Card declined'),
    (2, 2,  750.00, 'Completed', '2025-02-14', 'Return item'),
    (5, 1, 6300.00, 'Completed', '2025-03-03', 'Bulk order'),
    (3, 3, 1200.00, 'Completed', '2025-03-10', 'Monthly plan'),
    (6, 4,  980.00, 'Pending',   '2025-03-18', 'Consultation'),
    (1, 1, 3400.00, 'Completed', '2025-04-02', 'Clothing'),
    (5, 3, 1100.00, 'Completed', '2025-04-15', 'Monthly'),
    (4, 1, 5500.00, 'Completed', '2025-05-01', 'Furniture');


-- ============================================================
--  AGGREGATION QUERIES (COUNT, SUM, AVG, MAX, MIN)
-- ============================================================

-- 1. Overall totals across all transactions
SELECT
    COUNT(*)       AS total_transactions,
    SUM(amount)    AS total_amount,
    AVG(amount)    AS average_amount,
    MAX(amount)    AS highest_transaction,
    MIN(amount)    AS lowest_transaction
FROM transactions;


-- 2. Totals grouped by category
SELECT
    c.name                     AS category,
    COUNT(t.id)                AS total_transactions,
    SUM(t.amount)              AS total_amount,
    ROUND(AVG(t.amount), 2)   AS average_amount,
    MAX(t.amount)              AS max_amount,
    MIN(t.amount)              AS min_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY c.name
ORDER BY total_amount DESC;


-- 3. Totals grouped by status
SELECT
    status,
    COUNT(*)                   AS total_count,
    SUM(amount)                AS total_amount,
    ROUND(AVG(amount), 2)     AS average_amount
FROM transactions
GROUP BY status;


-- 4. Totals grouped by region (completed only)
SELECT
    r.name                     AS region,
    COUNT(t.id)                AS total_transactions,
    SUM(t.amount)              AS total_revenue,
    ROUND(AVG(t.amount), 2)   AS average_per_transaction,
    MAX(t.amount)              AS highest_transaction
FROM transactions t
JOIN customers cu ON t.customer_id = cu.id
JOIN regions r    ON cu.region_id  = r.id
WHERE t.status = 'Completed'
GROUP BY r.name
ORDER BY total_revenue DESC;


-- ============================================================
--  JOIN QUERIES (3+ tables, multiple JOINs)
-- ============================================================

-- 5. Full transaction view joining 3 tables:
--    transactions + customers + categories
SELECT
    t.id                       AS transaction_id,
    cu.name                    AS customer_name,
    cu.email                   AS customer_email,
    cat.name                   AS category,
    cat.description            AS category_description,
    t.amount,
    t.status,
    t.date,
    t.note
FROM transactions t
JOIN customers  cu  ON t.customer_id  = cu.id
JOIN categories cat ON t.category_id  = cat.id
ORDER BY t.date DESC;


-- 6. Full transaction view joining 4 tables:
--    transactions + customers + categories + regions
SELECT
    t.id                       AS transaction_id,
    cu.name                    AS customer_name,
    r.name                     AS region,
    cat.name                   AS category,
    t.amount,
    t.status,
    t.date
FROM transactions t
JOIN customers  cu  ON t.customer_id  = cu.id
JOIN categories cat ON t.category_id  = cat.id
JOIN regions    r   ON cu.region_id   = r.id
WHERE t.status = 'Completed'
ORDER BY t.date DESC;


-- 7. Customer summary joining 3 tables:
--    customers + transactions + regions
SELECT
    cu.name                    AS customer_name,
    cu.email,
    r.name                     AS region,
    COUNT(t.id)                AS total_transactions,
    SUM(t.amount)              AS total_spent,
    ROUND(AVG(t.amount), 2)   AS avg_per_transaction,
    MAX(t.amount)              AS highest_purchase,
    cu.joined
FROM customers cu
JOIN regions r          ON cu.region_id   = r.id
LEFT JOIN transactions t ON cu.id          = t.customer_id
GROUP BY cu.id, cu.name, cu.email, r.name, cu.joined
ORDER BY total_spent DESC;


-- ============================================================
--  SUBQUERIES (3 subqueries used)
-- ============================================================

-- 8. Subquery 1: Get customers with total spending above the overall average
--    (uses subquery in WHERE to get the average first)
SELECT
    cu.name                    AS customer_name,
    r.name                     AS region,
    SUM(t.amount)              AS total_spent
FROM customers cu
JOIN regions r          ON cu.region_id  = r.id
JOIN transactions t     ON cu.id         = t.customer_id
WHERE t.status = 'Completed'
GROUP BY cu.id, cu.name, r.name
HAVING SUM(t.amount) > (
    -- Subquery 1: compute the average total spending per customer
    SELECT AVG(customer_total)
    FROM (
        -- Subquery 2: compute each customer's total first
        SELECT customer_id, SUM(amount) AS customer_total
        FROM transactions
        WHERE status = 'Completed'
        GROUP BY customer_id
    )
)
ORDER BY total_spent DESC;


-- 9. Subquery 3: Get the most recent transaction for each customer
SELECT
    cu.name                    AS customer_name,
    t.amount                   AS last_transaction_amount,
    t.date                     AS last_transaction_date,
    cat.name                   AS category
FROM transactions t
JOIN customers  cu  ON t.customer_id = cu.id
JOIN categories cat ON t.category_id  = cat.id
WHERE t.date = (
    -- Subquery 3: get the max date for that specific customer
    SELECT MAX(t2.date)
    FROM transactions t2
    WHERE t2.customer_id = t.customer_id
)
ORDER BY t.date DESC;


-- ============================================================
--  CTE (Common Table Expression)
-- ============================================================

-- 10. CTE: Monthly transaction summary with running total
WITH monthly_data AS (
    -- Step 1: group completed transactions by month
    SELECT
        SUBSTR(date, 1, 7)         AS month,
        COUNT(*)                   AS transaction_count,
        SUM(amount)                AS monthly_revenue,
        ROUND(AVG(amount), 2)     AS avg_per_transaction,
        MAX(amount)                AS max_transaction
    FROM transactions
    WHERE status = 'Completed'
    GROUP BY SUBSTR(date, 1, 7)
)
-- Step 2: select from CTE and add a running total using a correlated subquery
SELECT
    month,
    transaction_count,
    monthly_revenue,
    avg_per_transaction,
    max_transaction,
    (
        SELECT SUM(monthly_revenue)
        FROM monthly_data md2
        WHERE md2.month <= md.month
    ) AS running_total
FROM monthly_data md
ORDER BY month ASC;


-- ============================================================
--  EXTRA USEFUL QUERIES
-- ============================================================

-- 11. Top spending customer per region
SELECT
    cu.name                    AS customer_name,
    r.name                     AS region,
    SUM(t.amount)              AS total_spent
FROM customers cu
JOIN regions r          ON cu.region_id  = r.id
JOIN transactions t     ON cu.id         = t.customer_id
WHERE t.status = 'Completed'
GROUP BY cu.id, cu.name, r.name
HAVING SUM(t.amount) > (
    SELECT AVG(customer_total)
    FROM (
        SELECT customer_id, SUM(amount) AS customer_total
        FROM transactions
        WHERE status = 'Completed'
        GROUP BY customer_id
    ) AS subq  
)
ORDER BY total_spent DESC;


-- 12. Transactions count by status and category (pivot-style)
SELECT
    cat.name                                                   AS category,
    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END)  AS completed,
    SUM(CASE WHEN t.status = 'Pending'   THEN 1 ELSE 0 END)  AS pending,
    SUM(CASE WHEN t.status = 'Failed'    THEN 1 ELSE 0 END)  AS failed,
    COUNT(*)                                                   AS total
FROM transactions t
JOIN categories cat ON t.category_id = cat.id
GROUP BY cat.name
ORDER BY total DESC;
