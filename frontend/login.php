<?php
session_start();

// Check if user is already logged in
if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit();
}

// Handle login form submission
$error_message = '';
$api_response = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // Basic validation
    if (empty($username) || empty($password)) {
        $error_message = 'Please enter both username and password.';
    } else {
        // API endpoint for login
        $api_url = 'http://localhost/thePayRollSystem/backend/users/login';

        // Prepare data
        $data = array(
            'username' => $username,
            'password' => $password
        );

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt_array($curl, array(
            CURLOPT_URL => $api_url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => array('Content-Type: application/json')
        ));

        // Execute request
        $response = curl_exec($curl);
        
        // Save the raw response for debugging
        $api_response = $response;

        // Check for errors
        if ($response === false) {
            $error_message = 'Connection error: ' . curl_error($curl);
        } else {
            // Decode response
            $result = json_decode($response, true);

            // Check if result is valid and has a status property
            if (is_array($result) && isset($result['status'])) {
                // Check login status
                if ($result['status'] === 'success' && isset($result['data'])) {
                    // Set session variables
                    $_SESSION['user_id'] = $result['data']['id'];
                    $_SESSION['username'] = $result['data']['username'];
                    $_SESSION['firstname'] = $result['data']['firstname'];
                    $_SESSION['lastname'] = $result['data']['lastname'];
                    $_SESSION['role'] = $result['data']['role'];

                    // Redirect to dashboard
                    header('Location: index.php');
                    exit();
                } else {
                    $error_message = $result['message'] ?? 'Invalid username or password.';
                }
            } else {
                $error_message = 'Invalid server response. Please try again.';
            }
        }

        // Close cURL
        curl_close($curl);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Pay Slip Generator System</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body {
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        
        .login-container {
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            padding: 30px;
        }
        
        .login-logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-logo h1 {
            color: #ff8c00;
            margin: 0;
        }
        
        .login-form {
            margin-bottom: 20px;
        }
        
        .login-form .form-group {
            margin-bottom: 20px;
        }
        
        .login-form .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .login-form .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            transition: border-color 0.3s ease;
        }
        
        .login-form .form-group input:focus {
            outline: none;
            border-color: #ff8c00;
        }
        
        .login-btn {
            background-color: #ff8c00;
            color: #fff;
            border: none;
            width: 100%;
            padding: 12px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .login-btn:hover {
            background-color: #e67e00;
        }
        
        .error-message {
            background-color: #ffebee;
            color: #d32f2f;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            border-left: 4px solid #f44336;
        }

        .debug-info {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-word;
            max-height: 200px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-logo">
            <h1>Pay Slip Generator</h1>
            <p>Sign in to access the system</p>
        </div>
        
        <?php if (!empty($error_message)): ?>
        <div class="error-message">
            <?php echo $error_message; ?>
        </div>
        <?php endif; ?>
        
        <form class="login-form" method="POST" action="login.php">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>">
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="login-btn">Login</button>
        </form>

        <!-- Debug information (only visible during development)
        <?php //if (!empty($api_response)): ?>
        <div class="debug-info">
            <strong>API Response:</strong>
            <?php //echo htmlspecialchars($api_response); ?>
        </div>
        <?php //endif; ?> -->
    </div>
</body>
</html>