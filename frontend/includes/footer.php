<?php
/**
 * Footer Template
 */
// Get base URL for script paths
$baseUrl = getBaseUrl();
?>

    <!-- Alert Container for JS notifications -->
    <div id="alert-container" class="alert-container"></div>

    <!-- JavaScript -->
    <script>
        // Set global API base URL
        const API_BASE_URL = '<?php echo $baseUrl; ?>backend/';
    </script>

    <!-- Load main scripts -->
    <script src="<?php echo $baseUrl; ?>assets/js/main.js"></script>
    
    <?php if(isset($page_script)) : ?>
    <!-- Load page specific script -->
    <script src="<?php echo $baseUrl; ?>assets/js/<?php echo $page_script; ?>"></script>
    <?php endif; ?>
    
    <!-- Load Modal Manager script (new addition) -->
    <script src="<?php echo $baseUrl; ?>assets/js/modal-manager.js"></script>
</body>
</html>