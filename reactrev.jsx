// Component function
//Inside, you usually declare state hooks at the top.
//Then return JSX (UI) that uses those state values.
// If a component doesn’t need any data from its parent, it doesn’t need props.
// Props can be anything: text, numbers, arrays, objects, or even functions.

import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';

// components : functions that return ui html like tags
// main component of the app, each component/function is individual
// everything must be inside of a component/function
export default function App() {

    return (
        <View style={styles.container}> // div with styling inside
            // Events: change when text input changes
            <TextInput placeholder="Type here" onChangeText={text => console.log(text)} />
            <Text>Hello, React Native!</Text> // text
            <Image source={require('./logo.png')} style={{ width: 100, height: 100 }} />
        </View>

    )
}

// counter component
function Counter() {

    // state: dynamic data inside a component that tracks changes to variables
    const [count, setCount] = useState(0); // useState is a hook, an inbuilt function that changes state variables and returns an array with variable and function
    // if you navigate away (switch component/screens) then the values are lost
    // use state returns an array with count variable and setcount function

    // component returns the UI JSX parts
    return (
        <View>
            <Text>Count: {count}</Text> // state counter
            <Button title="Increase" onPress={() => setCount(count + 1)} /> // function calls and increases state count
        </View>
    );
}


// props: inputs (params) passed into components and called there with an argument
function Greeting({ name }) {
    return <Text>Hello, {name}!</Text>;
}

function textReturn() {
    return (
        <View style={styles.container}>
            <Greeting name="Kerem" /> // called here with name value passed in and acts as the arg
            <Greeting name="Alice" />
        </View>
    );
}


// navigation between screens
const Stack = createNativeStackNavigator();

function switchScreens() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                //separate screens, home and profile
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// compoent to fetch data from backend/api etc
function fetchingFunction() {
    const [data, setData] = useState(null); // initiually null data

    useEffect(() => { // useffect hook for connecting to external services (api calls, backend database call, subscriptions)
        // Define an async function inside useEffect
        const fetchData = async () => {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
                const json = await response.json();
                setData(json); // we update the data state when we retrieve it
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <View style={{ padding: 20 }}>
            <Text>{data ? data.title : 'Loading...'}</Text>
        </View>
    );
}



// lists: When you have multiple items to display, use FlatList or ScrollView (for small lists).

const fruits = [
    { id: '1', name: 'Apple' },
    { id: '2', name: 'Banana' },
    { id: '3', name: 'Orange' },
];

function FruitList() {
    return (
        <FlatList
            data={fruits}
            keyExtractor={item => item.id} // unique key for each item
            renderItem={({ item }) => <Text>{item.name}</Text>}
        />
    );
}




// styling similar to css
// reusable in different areas with styles.container, styles.text etc
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        color: 'blue',
    },
});

