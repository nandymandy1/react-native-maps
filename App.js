import React, { Component } from 'react';
import { View, Text, Dimensions, StyleSheet, Alert, Platform } from 'react-native';
import { Constants, MapView, Permissions, Location } from 'expo';

// Using a local version here because we need it to import MapView from 'expo'
import MapViewDirections from './src/MapViewDirections';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 26.84119;
const LONGITUDE = 80.815616;
const LATITUDE_DELTA = 0.0722;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GOOGLE_MAPS_APIKEY = 'AIzaSyBGkNQJNcwVkQqnE3CO_zqUCF9ltiNo8O4';

export default class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			coordinates: [],
		};
		this.mapView = null;
  }
  
  // On the initialization of the application
  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
			this._getLocationAsync();
			setInterval(()=> {
				this._updateLocation();
			}, 10000);
    }
  }

  // Get the current user Location
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({
      coordinates:[
        ...this.state.coordinates,
        { latitude: location.coords.latitude, longitude: location.coords.longitude }
      ]
    });
    console.log(this.state.location);
	};
	
	_updateLocation = async () => {
		let location = await Location.getCurrentPositionAsync({});
		this.setState({
			coordinates:[
				{ latitude: location.coords.latitude, longitude: location.coords.longitude },
				this.state.coordinates[1]
			]
		});
	}

  // Update the location of the map on the tapped
	onMapPress = (e) => {
		if (this.state.coordinates.length == 2) {
			this.setState({
				coordinates: [
          e.nativeEvent.coordinate,
				],
			});
		} else {
			this.setState({
				coordinates: [
					...this.state.coordinates,
					e.nativeEvent.coordinate,
				],
			});
		}
  }
  
  // Watching a moving location
  startWatchPosition = () => {
    Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        timeInterval: 30000,
        distanceInterval: 150,
      },
      this._debouncedUpdateLocation
    );
  }

  _debouncedUpdateLocation = newLocation => {
    // if (this.timestamp === undefined) {
    //   store.dispatch(updateLocation(newLocation));
    //   this.timestamp = Date.now();
    // } else {
    //   const currTime = Date.now();
    //   const timeElapsed = currTime - this.timestamp;

    //   if (timeElapsed > 30000) {
    //     store.dispatch(updateLocation(newLocation));
    //     this.timestamp = currTime;
    //   }
    // }
    console.log(newLocation);
  }

	onReady = (result) => {
		this.mapView.fitToCoordinates(result.coordinates, {
			edgePadding: {
				right: (width / 20),
				bottom: (height / 20),
				left: (width / 20),
				top: (height / 20),
			}
		});
	}

	onError = (errorMessage) => {
		Alert.alert(errorMessage);
  }

	render() {
	  
	  // if (Platform.OS === 'android') {
    //   return (
	  //     <View style={styles.container}>
	  //       <Text>
	  //         {"For some reason Android crashes here on Expo, so you'll have to test this with iOS … Sorry"}
	  //       </Text>
	  //     </View>
    //   );
	  // }
	  
		return (
		  <View style={styles.container}>
  			<MapView
  				initialRegion={{
  					latitude: LATITUDE,
  					longitude: LONGITUDE,
  					latitudeDelta: LATITUDE_DELTA,
  					longitudeDelta: LONGITUDE_DELTA,
  				}}
  				style={StyleSheet.absoluteFill}
  				ref={c => this.mapView = c} // eslint-disable-line react/jsx-no-bind
  				onPress={this.onMapPress}
  				loadingEnabled={true}
  			>
  				{this.state.coordinates.map((coordinate, index) =>
  					<MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} /> // eslint-disable-line react/no-array-index-key
  				)}
  				{(this.state.coordinates.length === 2) && (
  					<MapViewDirections
  						origin={this.state.coordinates[0]}
  						destination={this.state.coordinates[1]}
  						apikey={GOOGLE_MAPS_APIKEY}
  						strokeWidth={3}
  						strokeColor="blue"
  						onReady={this.onReady}
  						onError={this.onError}
  					/>
  				)}
  			</MapView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});