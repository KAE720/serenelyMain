// OnboardingScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const onboardingSteps = [
    {
        id: 1,
        title: "Welcome to Serene",
        subtitle: "Better communication for couples & friends",
        description: "Serene helps you understand emotional tone in messages and communicate more effectively.",
        icon: "💙",
        color: "#4A90E2"
    },
    {
        id: 2,
        title: "Tone Analysis",
        subtitle: "Understand emotions in every message",
        description: "Each message is analyzed for emotional tone with color-coded bubbles and detailed explanations.",
        icon: "🎨",
        color: "#7B68EE"
    },
    {
        id: 3,
        title: "Smart Suggestions",
        subtitle: "Get AI-powered response recommendations",
        description: "Receive helpful suggestions for responding to different emotional tones appropriately.",
        icon: "🧠",
        color: "#20B2AA"
    },
    {
        id: 4,
        title: "AI Support",
        subtitle: "Meet Serene, your emotional companion",
        description: "Chat with our AI therapist for support, advice, and emotional guidance anytime.",
        icon: "🤖",
        color: "#FF6B6B"
    },
    {
        id: 5,
        title: "Your SerenID",
        subtitle: "Connect privately with friends",
        description: "Use your unique SerenID to add friends without sharing personal information.",
        icon: "🔐",
        color: "#32CD32"
    }
];

export default function OnboardingScreen({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = onboardingSteps[currentStep];

    return (
        <View style={styles.container}>
            {/* Skip button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: step.color + '20' }]}>
                    <Text style={styles.icon}>{step.icon}</Text>
                </View>

                {/* Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{step.title}</Text>
                    <Text style={styles.subtitle}>{step.subtitle}</Text>
                    <Text style={styles.description}>{step.description}</Text>
                </View>

                {/* Progress indicators */}
                <View style={styles.progressContainer}>
                    {onboardingSteps.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressDot,
                                {
                                    backgroundColor: index === currentStep
                                        ? step.color
                                        : '#333',
                                    transform: [{ scale: index === currentStep ? 1.2 : 1 }]
                                }
                            ]}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Navigation buttons */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    style={[styles.navButton, styles.previousButton]}
                    onPress={handlePrevious}
                    disabled={currentStep === 0}
                >
                    <Text style={[
                        styles.navButtonText,
                        currentStep === 0 && styles.disabledText
                    ]}>
                        Previous
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, styles.nextButton, { backgroundColor: step.color }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 1,
        padding: 10,
    },
    skipText: {
        color: '#666',
        fontSize: 16,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 100,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    icon: {
        fontSize: 60,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#4A90E2',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: width - 80,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 6,
        transition: 'all 0.3s ease',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    navButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        minWidth: 120,
        alignItems: 'center',
    },
    previousButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#333',
    },
    nextButton: {
        // backgroundColor set dynamically
    },
    navButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledText: {
        color: '#333',
    },
});
