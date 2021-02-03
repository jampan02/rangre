import React, { useContext, useEffect } from "react";
import { globalContext, GNAVIDATA } from "../App";
import MapViewDirections from "react-native-maps-directions";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import {
  Linking,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
const thumb = require("../images/loadingImage.gif");
const person = require("../images/walking_person.png");
const update = require("../images/update_button.png");
const assetImg = Image.resolveAssetSource(thumb);
const personImage = Image.resolveAssetSource(person);
const updateImage = Image.resolveAssetSource(update);
var XMLParser = require("react-xml-parser");

export type DISPATCH_DATA = {
  shopDatas: {
    name: string;
    longitude: string;
    latitude: string;
    holiday: string;
    image_url: string | undefined;
    url: string | undefined;
    address: string | undefined;
    genre_name: string | undefined;
  };
};

type SHOPDATA = {
  name: string;
  latitude: string;
  longitude: string;
  holiday: string;
  image_url?: string;
  url?: string;
  address?: string;
  genre_name?: string;
};

const MainScreen: React.FC = () => {
  const [countTimesOfChanged, setCountTimesOfChanged] = useState(0);
  const [distance, setDistance] = useState<undefined | number>();
  const [destinationData, setDestinationData] = useState<
    SHOPDATA | undefined
  >();
  const [isFirst, setIsFirst] = useState(true);
  const { dispatch } = useContext(globalContext);
  const { state } = useContext(globalContext);
  //設定された、range内の店の情報を集めた配列
  let ShopData: SHOPDATA[] = [];

  let location: any;

  useEffect(() => {
    getCurrentPlace();
  }, []);

  const getCurrentPlace = () => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      location = await Location.watchPositionAsync(
        {
          distanceInterval: 3,
          accuracy: 6,
        },
        (locationObject) => successFunc(locationObject)
      );
    })();
  };

  //ぐるなびデータセット関数
  const onGetGnaviData = (data: GNAVIDATA) => {
    for (const shopData of data.rest) {
      ShopData = [
        ...ShopData,
        {
          name: shopData.name,
          latitude: shopData.latitude,
          longitude: shopData.longitude,
          holiday: shopData.holiday,
          image_url: shopData.image_url.shop_image1,
          url: shopData.url,
          address: shopData.address,
          genre_name: shopData.category,
        },
      ];
    }
  };
  //ほっとぺっぱーセット関数
  const onGetHotpepperData = (data: any) => {
    var xml = new XMLParser().parseFromString(data);
    const xmlData = xml.getElementsByTagName("shop");
    for (const hotpepperData of xmlData) {
      //ジャンルネームがある場合の処理
      if (hotpepperData.getElementsByTagName("genre")[0].children[1].value) {
        ShopData = [
          ...ShopData,
          {
            name: hotpepperData.children[1].value,
            image_url: hotpepperData.children[2].value,
            latitude: hotpepperData.getElementsByTagName("lat")[0].value,
            longitude: hotpepperData.getElementsByTagName("lng")[0].value,
            holiday: hotpepperData.getElementsByTagName("close")[0].value,
            url: hotpepperData.getElementsByTagName("pc")[0].value,
            address: hotpepperData.getElementsByTagName("address")[0].value,
            genre_name: hotpepperData.getElementsByTagName("genre")[0]
              .children[1].value,
          },
        ];
      } else {
        //ない場合の処理
        ShopData = [
          ...ShopData,
          {
            name: hotpepperData.children[1].value,
            image_url: hotpepperData.children[2].value,
            latitude: hotpepperData.getElementsByTagName("lat")[0].value,
            longitude: hotpepperData.getElementsByTagName("lng")[0].value,
            holiday: hotpepperData.getElementsByTagName("close")[0].value,
            url: hotpepperData.getElementsByTagName("pc")[0].value,
            address: hotpepperData.getElementsByTagName("address")[0].value,
          },
        ];
      }
    }
  };

  const getShop = async (position: any) => {
    const gnaviUri = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid="YOUR GNAVI API KEY"&range=1&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`;
    const hotpepperUri = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key="YOUR HOTPEPPER API KEY&lat=${position.coords.latitude}&lng=${position.coords.longitude}&range=1`;

    //ぐるなび通信
    await fetch(gnaviUri, { mode: "cors" })
      .then((res) => {
        return res.json();
      })
      .then((data: GNAVIDATA) => {
        onGetGnaviData(data);
      })
      .catch(() => {
        return;
      });

    //ほっぺ通信
    await fetch(hotpepperUri, { mode: "cors" })
      .then((res) => res.text())
      .then((data) => {
        onGetHotpepperData(data);
      })
      .catch(() => {
        return;
      });

    let dataBox: DISPATCH_DATA[] = [];
    for (const data of ShopData) {
      dataBox = [
        ...dataBox,
        {
          shopDatas: {
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            holiday: data.holiday,
            image_url: data.image_url,
            url: data.url,
            address: data.address,
            genre_name: data.genre_name,
          },
        },
      ];
    }
    dispatch({
      type: "SET_SHOPDATAS",
      payload: { dataBox },
    });
    const date = new Date();
    const dayOfWeek = date.getDay();
    const dayOfWeekStr = ["日", "月", "火", "水", "木", "金", "土"][dayOfWeek];
    const filteredbox = [];
    if (dataBox) {
      for (const data of dataBox) {
        const result = new RegExp(dayOfWeekStr).test(data.shopDatas.holiday);
        if (!result) {
          filteredbox.push(data.shopDatas);
        }
      }
    }
    //filteredboxが空っぽの場合
    "shopdate=" + ShopData;
    if (!ShopData[0]) {
      ("no shopdata");
      Alert.alert("半径300m圏内に営業中の飲食店がありません。");
      return;
    }
    const destination =
      filteredbox[Math.floor(Math.random() * filteredbox.length)];
    destination;
    setDestinationData(destination);
  };
  let stop = true;
  const successFunc = async (position: Location.LocationObject) => {
    position.coords.latitude;
    isFirst;
    dispatch({
      type: "SET_LAT_LNG",
      payload: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
    });
    if (stop) {
      stop = false;
      getShop(position);
    }
    destinationData;
  };

  return (
    <View
      style={{
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      }}
    >
      {!state.lat ? (
        !destinationData ? (
          <View style={styles.loading}>
            <Image
              style={[
                styles.loadingImage,
                {
                  transform: [
                    { translateX: -assetImg.width / 2 },
                    { translateY: -assetImg.height / 2 },
                  ],
                },
              ]}
              source={assetImg}
            />
          </View>
        ) : (
          <View style={styles.loading}>
            <Image
              style={[
                styles.loadingImage,
                {
                  transform: [
                    { translateX: -assetImg.width / 2 },
                    { translateY: -assetImg.height / 2 },
                  ],
                },
              ]}
              source={assetImg}
            />
          </View>
        )
      ) : null}
      {state.lat ? (
        destinationData ? (
          <MapView
            style={styles.mapStyle}
            initialRegion={{
              latitude: state.lat,
              longitude: state.lng,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            }}
          >
            {state.lat ? (
              personImage ? (
                <Marker
                  image={personImage}
                  coordinate={{ latitude: state.lat, longitude: state.lng }}
                />
              ) : null
            ) : null}
            {destinationData && (
              <Marker
                coordinate={{
                  latitude: Number(destinationData.latitude),
                  longitude: Number(destinationData.longitude),
                }}
              />
            )}
            {destinationData && (
              <MapViewDirections
                onReady={({ distance }) =>
                  setDistance((distance as number) * 1000)
                }
                language="ja"
                mode="WALKING"
                strokeColor="hotpink"
                strokeWidth={3}
                origin={{
                  latitude: state.lat,
                  longitude: state.lng,
                }}
                destination={{
                  latitude: Number(destinationData.latitude),
                  longitude: Number(destinationData.longitude),
                }}
                apikey="YOUR GOOGLE API KEY"
              />
            )}
          </MapView>
        ) : null
      ) : null}
      {distance && (
        <Text
          style={{
            lineHeight: 20,
            marginLeft: 5,
            marginTop: 5,
          }}
        >
          {distance}m
        </Text>
      )}
      {destinationData ? (
        <View
          style={{
            height: "20%",
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 10,
          }}
        >
          <Text style={{ fontWeight: "bold", lineHeight: 30, fontSize: 18 }}>
            {destinationData.name}{" "}
            <Text style={{ fontSize: 14 }}>{destinationData.genre_name}</Text>
          </Text>
          <Text style={{ lineHeight: 30 }}>{destinationData.address}</Text>
          <Text
            style={{ color: "blue", lineHeight: 30 }}
            onPress={() =>
              destinationData.url && Linking.openURL(destinationData.url)
            }
          >
            今すぐ予約！
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: destinationData.image_url as any }}
              style={{
                height: 100,
                width: 100,
                marginTop: 50,
                marginRight: 20,
              }}
            />
          </View>
        </View>
      ) : null}
      {destinationData && (
        <TouchableOpacity
          onPress={() => {
            if (countTimesOfChanged === 5) {
              Alert.alert("5回以上は変えられないよ！");
              return;
            }
            getCurrentPlace();
            setCountTimesOfChanged((prev) => prev + 1);
          }}
          style={styles.updateButton}
        >
          <Image source={updateImage} style={styles.updateButtonImage} />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  mapStyle: {
    width: "100%",
    height: "70%",
  },
  updateButton: {
    position: "absolute",
    right: "5%",
    top: "5%",
  },
  updateButtonImage: {
    height: 60,
    width: 60,
  },
  loading: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loadingImage: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});

export default MainScreen;
