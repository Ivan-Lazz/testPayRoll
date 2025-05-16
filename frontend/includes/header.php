<?php
session_start();

// Check if user is not logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ' . getBaseUrl() . 'login.php');
    exit();
}

// Get current page
$current_page = basename($_SERVER['PHP_SELF']);

// Define base URL function to get absolute paths
function getBaseUrl() {
    // Get the protocol (http or https)
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    
    // Get the host (e.g., localhost)
    $host = $_SERVER['HTTP_HOST'];
    
    // Get the directory, but strip off any page directories
    $path = dirname($_SERVER['PHP_SELF']);
    
    // If we're in a subdirectory like /pages, adjust the path to point to the root
    if (strpos($path, '/pages') !== false) {
        $path = str_replace('/pages', '', $path);
    }
    
    // Ensure path ends with trailing slash
    if (substr($path, -1) !== '/') {
        $path .= '/';
    }
    
    return $protocol . $host . $path;
}

// Define the base URL for use in links and resources
$base_url = getBaseUrl();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pay Slip Generator System</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="<?php echo $base_url; ?>assets/css/style.css">
    <link rel="stylesheet" href="<?php echo $base_url; ?>assets/css/modal.css">
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>Pay Slip Generator</h2>
            </div>
            <ul class="sidebar-menu">
                <li>
                    <a href="<?php echo $base_url; ?>index.php" class="<?php echo $current_page == 'index.php' ? 'active' : ''; ?>">
                        <i class="fas fa-home"></i> Dashboard
                    </a>
                </li>
                <li>
                    <a href="<?php echo $base_url; ?>pages/users.php" class="<?php echo $current_page == 'users.php' ? 'active' : ''; ?>">
                        <i class="fas fa-users"></i> Users
                    </a>
                </li>
                <li>
                    <a href="<?php echo $base_url; ?>pages/employees.php" class="<?php echo $current_page == 'employees.php' ? 'active' : ''; ?>">
                        <i class="fas fa-user-tie"></i> Employees
                    </a>
                </li>
                <li>
                    <a href="<?php echo $base_url; ?>pages/accounts.php" class="<?php echo $current_page == 'accounts.php' ? 'active' : ''; ?>">
                        <i class="fas fa-user-cog"></i> Employee Accounts
                    </a>
                </li>
                <li>
                    <a href="<?php echo $base_url; ?>pages/banking.php" class="<?php echo $current_page == 'banking.php' ? 'active' : ''; ?>">
                        <i class="fas fa-university"></i> Banking Details
                    </a>
                </li>
                <li>
                    <a href="<?php echo $base_url; ?>pages/payslips.php" class="<?php echo $current_page == 'payslips.php' ? 'active' : ''; ?>">
                        <i class="fas fa-file-invoice-dollar"></i> Pay Slips
                    </a>
                </li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="header">
                <h1>Pay Slip Generator</h1>
                <div class="user-info">
                    <span>Welcome, <?php echo $_SESSION['firstname'] . ' ' . $_SESSION['lastname']; ?></span>
                    <button class="logout-btn" id="logout-btn" data-logout-url="<?php echo $base_url; ?>logout.php">Logout</button>
                </div>
            </div>

            <!-- Alert Container -->
            <div id="alert-container"></div>