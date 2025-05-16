<?php
// Create a hash for 'Admin@123'
$password = 'Admin@123';
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Password: $password\n";
echo "Hash: $hash\n";

// Verify the hash works
$verify = password_verify($password, $hash);
echo "Verification: " . ($verify ? "Success" : "Failed");
?>