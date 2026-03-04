const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

async function run() {
  const hash = await bcrypt.hash("Nguyendinhduy@95", 10);
  console.log("Hash generated");
  
  const pool = new Pool({
    connectionString: "postgresql://postgres:SmK_Pr0d_2026!Secure@localhost:5432/sieuthimatkinh?schema=public"
  });
  
  const result = await pool.query(
    `INSERT INTO users (id, email, phone, name, role, password, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5::"Role", $6, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET role = $5::"Role", name = $4, password = $6
     RETURNING id, email, name, role`,
    ["admin_nguyendinhduy", "nguyendinhduy@sieuthimatkinh.vn", "0900000001", "Nguyen Dinh Duy", "ADMIN", hash]
  );
  console.log("Admin created:", JSON.stringify(result.rows[0]));
  await pool.end();
}
run().catch(e => console.error("Error:", e.message));
