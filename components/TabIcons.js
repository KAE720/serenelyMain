// components/TabIcons.js
import React from 'react';
import { View, Text } from 'react-native';

// Custom SVG-style icons using simple shapes and text
export const MessageIcon = ({ active, size = 24 }) => (
    <View style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <View style={{
            width: size * 0.8,
            height: size * 0.6,
            borderWidth: 2,
            borderColor: active ? '#1976D2' : '#aaa',
            borderRadius: size * 0.15,
            backgroundColor: 'transparent',
            position: 'relative',
        }}>
            {/* Message lines */}
            <View style={{
                position: 'absolute',
                top: size * 0.12,
                left: size * 0.08,
                right: size * 0.08,
                height: 1,
                backgroundColor: active ? '#1976D2' : '#aaa',
            }} />
            <View style={{
                position: 'absolute',
                top: size * 0.22,
                left: size * 0.08,
                width: size * 0.4,
                height: 1,
                backgroundColor: active ? '#1976D2' : '#aaa',
            }} />
            {/* Chat bubble tail */}
            <View style={{
                position: 'absolute',
                bottom: -2,
                left: size * 0.1,
                width: 0,
                height: 0,
                borderLeftWidth: 4,
                borderRightWidth: 4,
                borderTopWidth: 4,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: active ? '#1976D2' : '#aaa',
            }} />
        </View>
    </View>
);

export const PhoneIcon = ({ active, size = 24 }) => (
    <View style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        {/* Modern smartphone body */}
        <View style={{
            width: size * 0.45,
            height: size * 0.7,
            borderWidth: 2,
            borderColor: active ? '#1976D2' : '#aaa',
            borderRadius: size * 0.08,
            backgroundColor: 'transparent',
            position: 'relative',
        }}>
            {/* Screen */}
            <View style={{
                position: 'absolute',
                top: size * 0.06,
                left: size * 0.03,
                right: size * 0.03,
                bottom: size * 0.06,
                backgroundColor: active ? '#E3F2FD' : '#f0f0f0',
                borderRadius: size * 0.04,
            }} />

            {/* Home button */}
            <View style={{
                position: 'absolute',
                bottom: size * 0.02,
                left: '50%',
                marginLeft: -size * 0.03,
                width: size * 0.06,
                height: size * 0.03,
                borderRadius: size * 0.015,
                backgroundColor: active ? '#1976D2' : '#aaa',
            }} />
        </View>

        {/* Signal waves */}
        <View style={{
            position: 'absolute',
            right: size * 0.1,
            top: size * 0.15,
        }}>
            {/* Wave 1 - smallest */}
            <View style={{
                position: 'absolute',
                width: size * 0.08,
                height: size * 0.08,
                borderWidth: 1.5,
                borderColor: active ? '#1976D2' : '#aaa',
                borderRadius: size * 0.04,
                backgroundColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                transform: [{ rotate: '45deg' }],
            }} />

            {/* Wave 2 - medium */}
            <View style={{
                position: 'absolute',
                top: -size * 0.04,
                left: -size * 0.04,
                width: size * 0.16,
                height: size * 0.16,
                borderWidth: 1.5,
                borderColor: active ? '#1976D2' : '#aaa',
                borderRadius: size * 0.08,
                backgroundColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                transform: [{ rotate: '45deg' }],
            }} />

            {/* Wave 3 - largest */}
            <View style={{
                position: 'absolute',
                top: -size * 0.08,
                left: -size * 0.08,
                width: size * 0.24,
                height: size * 0.24,
                borderWidth: 1.5,
                borderColor: active ? '#1976D2' : '#aaa',
                borderRadius: size * 0.12,
                backgroundColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                transform: [{ rotate: '45deg' }],
            }} />
        </View>
    </View>
);

export const ContactsIcon = ({ active, size = 24 }) => (
    <View style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        {/* First person */}
        <View style={{
            position: 'absolute',
            left: 2,
            top: 2,
        }}>
            <View style={{
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: size * 0.175,
                borderWidth: 2,
                borderColor: active ? '#1976D2' : '#aaa',
                backgroundColor: 'transparent',
            }} />
            <View style={{
                width: size * 0.5,
                height: size * 0.4,
                borderTopLeftRadius: size * 0.25,
                borderTopRightRadius: size * 0.25,
                borderWidth: 2,
                borderColor: active ? '#1976D2' : '#aaa',
                backgroundColor: 'transparent',
                marginTop: -2,
                marginLeft: -size * 0.075,
            }} />
        </View>

        {/* Second person */}
        <View style={{
            position: 'absolute',
            right: 2,
            top: 6,
        }}>
            <View style={{
                width: size * 0.3,
                height: size * 0.3,
                borderRadius: size * 0.15,
                borderWidth: 2,
                borderColor: active ? '#1976D2' : '#aaa',
                backgroundColor: 'transparent',
            }} />
            <View style={{
                width: size * 0.45,
                height: size * 0.35,
                borderTopLeftRadius: size * 0.225,
                borderTopRightRadius: size * 0.225,
                borderWidth: 2,
                borderColor: active ? '#1976D2' : '#aaa',
                backgroundColor: 'transparent',
                marginTop: -2,
                marginLeft: -size * 0.075,
            }} />
        </View>
    </View>
);

export const SereneIcon = ({ active, size = 24 }) => (
    <View style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        {/* Meditation pose */}
        <View style={{
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            borderWidth: 2,
            borderColor: active ? '#1976D2' : '#aaa',
            backgroundColor: 'transparent',
            marginBottom: 2,
        }} />

        {/* Body in meditation pose */}
        <View style={{
            width: size * 0.6,
            height: size * 0.35,
            borderTopLeftRadius: size * 0.3,
            borderTopRightRadius: size * 0.3,
            borderWidth: 2,
            borderColor: active ? '#1976D2' : '#aaa',
            backgroundColor: 'transparent',
            position: 'relative',
        }}>
            {/* Arms in meditation */}
            <View style={{
                position: 'absolute',
                top: size * 0.1,
                left: -size * 0.05,
                width: size * 0.15,
                height: size * 0.15,
                borderRadius: size * 0.075,
                borderWidth: 1,
                borderColor: active ? '#1976D2' : '#aaa',
                backgroundColor: 'transparent',
            }} />
            <View style={{
                position: 'absolute',
                top: size * 0.1,
                right: -size * 0.05,
                width: size * 0.15,
                height: size * 0.15,
                borderRadius: size * 0.075,
                borderWidth: 1,
                borderColor: active ? '#1976D2' : '#aaa',
                backgroundColor: 'transparent',
            }} />
        </View>

        {/* Zen dots above head */}
        <View style={{
            position: 'absolute',
            top: 0,
            flexDirection: 'row',
            gap: 2,
        }}>
            <View style={{
                width: 2,
                height: 2,
                borderRadius: 1,
                backgroundColor: active ? '#1976D2' : '#aaa',
            }} />
            <View style={{
                width: 2,
                height: 2,
                borderRadius: 1,
                backgroundColor: active ? '#1976D2' : '#aaa',
            }} />
            <View style={{
                width: 2,
                height: 2,
                borderRadius: 1,
                backgroundColor: active ? '#1976D2' : '#aaa',
            }} />
        </View>
    </View>
);
