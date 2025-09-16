// colorHelper.js
// Helper functions for mapping emotion colors to UI styles

// Color mapping for emotion tones
export const EMOTION_COLORS = {
    'red': '#FF6B6B',      // Angry - warm red
    'orange': '#FFA726',   // Stressed - orange
    'blue': '#42A5F5',     // Neutral - calm blue
    'green': '#66BB6A'     // Excited - happy green
};

// Get background color for message bubble based on emotion color
export function getMessageBubbleColor(emotionColor, isCurrentUser = false) {
    if (isCurrentUser) {
        // For current user messages, use emotion color as background
        return EMOTION_COLORS[emotionColor] || EMOTION_COLORS.blue;
    } else {
        // For other user messages, use light gray background with colored border
        return '#F5F5F5';
    }
}

// Get border color for message bubble
export function getMessageBorderColor(emotionColor) {
    return EMOTION_COLORS[emotionColor] || EMOTION_COLORS.blue;
}

// Get text color for message bubble (ensures readability)
export function getMessageTextColor(emotionColor, isCurrentUser = false) {
    if (isCurrentUser) {
        // White text on colored background for current user
        return '#FFFFFF';
    } else {
        // Dark text on light background for other users
        return '#333333';
    }
}

// Get emotion label for display
export function getEmotionLabel(emotionColor) {
    const labels = {
        'red': 'Angry',
        'orange': 'Stressed',
        'blue': 'Neutral',
        'green': 'Excited'
    };
    return labels[emotionColor] || 'Neutral';
}

// Get emotion icon (optional, for future use)
export function getEmotionIcon(emotionColor) {
    const icons = {
        'red': '😠',
        'orange': '😰',
        'blue': '😐',
        'green': '😊'
    };
    return icons[emotionColor] || '😐';
}
