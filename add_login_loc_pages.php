<?php
$files = glob(base_path('Frontend/kamera/*/index.html'));

$btn = '
                <!-- Login Button -->
                <a href="/login.html" class="navbar__wishlist-btn" aria-label="Akun" title="Login / Akun" id="navAccountBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </a>
            </div>';

foreach ($files as $path) {
    if (file_exists($path)) {
        $content = file_get_contents($path);
        
        // Match the wishlist button closing structure up to the </div> of navbar__actions
        $pattern = '/<span class="nav-wishlist-count">0<\/span>\s*<\/a>\s*<\/div>/is';
        
        $replacement = '<span class="nav-wishlist-count">0</span>
                </a>' . $btn;
                
        $newContent = preg_replace($pattern, $replacement, $content);
        
        if ($newContent !== null && $newContent !== $content) {
            file_put_contents($path, $newContent);
            echo "Successfully updated " . basename(dirname($path)) . "/index.html\n";
        } else {
            echo "Failed to update or already updated " . basename(dirname($path)) . "/index.html\n";
        }
    }
}
