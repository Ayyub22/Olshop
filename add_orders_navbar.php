<?php
$dir = new RecursiveDirectoryIterator(base_path('Frontend'));
$iterator = new RecursiveIteratorIterator($dir);
$files = [];

foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'html' && strpos($file->getFilename(), 'orders.html') === false) {
        $files[] = $file->getPathname();
    }
}

$btnOrdersText = '
                <a href="/orders.html" style="position:relative; display:flex; align-items:center; gap:6px; color:#FF0000;" id="navOrdersBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"></path>
                    </svg>
                    Pesanan
                </a>';

$btnOrdersIcon = '
                <a href="/orders.html" class="navbar__wishlist-btn" aria-label="Pesanan" title="Pesanan" id="navOrdersBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"></path>
                    </svg>
                </a>';

foreach ($files as $path) {
    $content = file_get_contents($path);
    $originalContent = $content;
    
    // Skip if already added
    if (strpos($content, '/orders.html') !== false || strpos($content, 'navOrdersBtn') !== false) {
        continue;
    }

    // Replace login button with orders + login button
    $pattern = '/(<a href="\/login\.html"[^>]*>|<a href="\/admin\/"[^>]*>)/is';
    
    $replacement = function ($matches) use ($btnOrdersText, $btnOrdersIcon) {
        // If the login link has "navbar__wishlist-btn", it means it's icon based
        if (strpos($matches[1], 'navbar__wishlist-btn') !== false) {
            return $btnOrdersIcon . "\n                <!-- Login Button -->\n                " . $matches[1];
        } else {
            return $btnOrdersText . "\n                " . $matches[1];
        }
    };
    
    // In index.html, there's a comment <!-- Login Button --> right before the a href. Let's see if we can match that too to be clean.
    $patternClean = '/(<!-- Login Button -->\s*)?(<a href="\/login\.html"[^>]*>|<a href="\/admin\/"[^>]*>)/is';
    
    $replacementClean = function ($matches) use ($btnOrdersText, $btnOrdersIcon) {
        // matches[1] = optional comment, matches[2] = a tag
        $comment = $matches[1] ? $matches[1] : '';
        $aTag = $matches[2];
        
        if (strpos($aTag, 'navbar__wishlist-btn') !== false) {
            return $btnOrdersIcon . "\n                " . $comment . $aTag;
        } else {
            // Text style based layouts like brand.html
            return $btnOrdersText . "\n                " . $comment . $aTag;
        }
    };

    $content = preg_replace_callback($patternClean, $replacementClean, $content);

    if ($content !== $originalContent) {
        file_put_contents($path, $content);
        echo "Successfully updated " . basename($path) . "\n";
    }
}
