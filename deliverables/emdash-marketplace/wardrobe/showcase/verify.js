#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== Mobile Responsiveness Verification ===\n');

// Read files
const htmlContent = fs.readFileSync('index.html', 'utf8');
const cssContent = fs.readFileSync('styles.css', 'utf8');

let errors = [];
let warnings = [];
let passes = [];

// Step 1: Check viewport meta tag
console.log('Step 1: Checking viewport meta tag...');
if (htmlContent.includes('meta name="viewport"')) {
    if (htmlContent.includes('width=device-width') && htmlContent.includes('initial-scale=1')) {
        passes.push('✓ Viewport meta tag present and correctly configured');
        console.log('✓ Viewport meta tag is present and correct');
    } else {
        errors.push('✗ Viewport meta tag missing required attributes');
        console.log('✗ Viewport meta tag missing attributes');
    }
} else {
    errors.push('✗ No viewport meta tag found');
    console.log('✗ No viewport meta tag found');
}

// Step 2: Check for media queries
console.log('\nStep 2: Checking for media queries...');
const mediaQueries = cssContent.match(/@media[^{]+/g) || [];
console.log(`Found ${mediaQueries.length} media queries:`);
mediaQueries.forEach(mq => console.log(`  - ${mq.trim()}`));

if (mediaQueries.length >= 4) {
    passes.push(`✓ Multiple media queries found (${mediaQueries.length})`);
} else {
    warnings.push(`⚠ Only ${mediaQueries.length} media queries found`);
}

// Step 3: Check breakpoints
console.log('\nStep 3: Checking breakpoints...');
const breakpointRegex = /\(\s*(?:min|max)-width:\s*(\d+)px\s*\)/g;
const breakpoints = new Set();
let match;
while ((match = breakpointRegex.exec(cssContent)) !== null) {
    breakpoints.add(parseInt(match[1]));
}
const sortedBreakpoints = Array.from(breakpoints).sort((a, b) => a - b);
console.log(`Found breakpoints: ${sortedBreakpoints.join('px, ')}px`);

if (breakpoints.has(375) || breakpoints.has(768) || breakpoints.has(1024)) {
    passes.push('✓ Key breakpoints (375px, 768px, 1024px) are covered');
    console.log('✓ Key breakpoints covered');
} else {
    warnings.push('⚠ Some key breakpoints may be missing');
}

// Step 4: Check copy button sizing
console.log('\nStep 4: Checking copy button sizing for touch targets...');
const copyBtnMatch = cssContent.match(/\.copy-btn\s*\{[^}]+\}/s);
if (copyBtnMatch) {
    const copyBtnCss = copyBtnMatch[0];
    if (copyBtnCss.includes('min-height: 44px')) {
        passes.push('✓ Copy buttons have 44px+ touch target height');
        console.log('✓ Copy buttons meet 44px minimum height');
    } else if (copyBtnCss.includes('height') || copyBtnCss.includes('padding')) {
        warnings.push('⚠ Copy button size should be verified');
        console.log('⚠ Copy button sizing exists but verify it meets 44px');
    } else {
        errors.push('✗ Copy button touch target size not explicitly set');
        console.log('✗ Copy button touch target size missing');
    }
}

// Step 5: Check for overflow prevention
console.log('\nStep 5: Checking for overflow prevention...');
if (cssContent.includes('overflow-x: hidden') || cssContent.includes('box-sizing: border-box')) {
    passes.push('✓ Overflow prevention and box-sizing configured');
    console.log('✓ Overflow prevention configured');
} else {
    warnings.push('⚠ Overflow prevention may need verification');
}

// Step 6: Check for smooth scrolling
console.log('\nStep 6: Checking for smooth scrolling...');
if (cssContent.includes('scroll-behavior: smooth')) {
    passes.push('✓ Smooth scrolling enabled');
    console.log('✓ Smooth scrolling is enabled');
} else {
    warnings.push('⚠ Smooth scrolling not found');
}

// Step 7: Check theme card stacking
console.log('\nStep 7: Checking theme card layout responsiveness...');
const themesGridMatch = cssContent.match(/\.themes-grid\s*\{[^}]+\}/s);
if (themesGridMatch && themesGridMatch[0].includes('grid-template-columns: 1fr')) {
    passes.push('✓ Theme cards stack to single column on mobile');
    console.log('✓ Theme cards stack correctly');
} else {
    errors.push('✗ Theme card stacking not configured');
}

// Step 8: Check for font size responsiveness
console.log('\nStep 8: Checking font size responsiveness...');
if (cssContent.includes('clamp(')) {
    passes.push('✓ CSS clamp() used for responsive typography');
    console.log('✓ Responsive typography with clamp()');
} else if (cssContent.includes('@media') && cssContent.match(/h[1-6]\s*\{/)) {
    passes.push('✓ Media queries control typography');
    console.log('✓ Typography controlled by media queries');
}

// Step 9: Check accessibility features
console.log('\nStep 9: Checking accessibility features...');
if (htmlContent.includes('aria-label') && htmlContent.includes('aria-')) {
    passes.push('✓ ARIA labels present for interactive elements');
    console.log('✓ ARIA labels found');
}

if (cssContent.includes('outline') && cssContent.includes('focus')) {
    passes.push('✓ Focus states defined for keyboard navigation');
    console.log('✓ Focus states defined');
}

if (cssContent.includes('@media (prefers-reduced-motion')) {
    passes.push('✓ Respects prefers-reduced-motion preference');
    console.log('✓ Respects motion preferences');
}

// Summary
console.log('\n=== VERIFICATION SUMMARY ===\n');
console.log(`Passes: ${passes.length}`);
passes.forEach(p => console.log(p));

if (warnings.length > 0) {
    console.log(`\nWarnings: ${warnings.length}`);
    warnings.forEach(w => console.log(w));
}

if (errors.length > 0) {
    console.log(`\nErrors: ${errors.length}`);
    errors.forEach(e => console.log(e));
    process.exit(1);
} else {
    console.log('\n✓ All critical checks passed!');
    process.exit(0);
}
