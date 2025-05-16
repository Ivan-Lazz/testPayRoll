</div>
    </div>

    <!-- JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="<?php echo $base_url; ?>assets/js/main.js"></script>
    <?php if (isset($page_script)): ?>
    <script src="<?php echo $base_url; ?><?php echo $page_script; ?>"></script>
    <?php endif; ?>
    
    <script>
    // Set API base URL for JavaScript
    const API_BASE_URL = '<?php echo $base_url; ?>backend/';
    
    // Custom logout handling
    document.addEventListener('DOMContentLoaded', function() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                const logoutUrl = this.getAttribute('data-logout-url');
                window.location.href = logoutUrl;
            });
        }
    });
    </script>
</body>
</html>