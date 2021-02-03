import React, { useReducer } from "react";
import * as gnaviData from "./types/gnaviDataTypes.json";
import MainScreen, { DISPATCH_DATA } from "./screens/MainScreen";
import { View } from "react-native";
export type GNAVIDATA = typeof gnaviData;

//type SHOPDATATYPE = typeof gnaviData.rest[0];

//データの型
export type DATA = {
  lat: number;
  lng: number;
  dataBox: DISPATCH_DATA[];
  destination?: any;
};

//actionの型
type ACTION = {
  type: any;
  payload: { lat?: any; lng?: any; dataBox?: any; destination?: any };
};

//初期値
const initialState = {
  lat: 0,
  lng: 0,
  dataBox: [],
  destination: {},
};

const reducer = (state: DATA, action: ACTION) => {
  switch (action.type) {
    case "SET_LAT_LNG":
      return {
        ...state,
        lat: action.payload.lat,
        lng: action.payload.lng,
      };
    case "SET_SHOPDATAS":
      if (action.payload.dataBox) {
        return {
          ...state,
          dataBox: action.payload.dataBox,
        };
      }
      return state;
    case "SET_DESTINATION":
      return {
        ...state,
        destination: action.payload.destination,
      };
    default:
      return state;
  }
};

export const globalContext = React.createContext(
  {} as {
    state: DATA;
    dispatch: React.Dispatch<ACTION>;
  }
);

const GlobalContext: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <View>
      <globalContext.Provider value={{ state, dispatch }}>
        {children}
      </globalContext.Provider>
    </View>
  );
};

const App: React.FC = () => {
  return (
    <GlobalContext>
      <MainScreen />
    </GlobalContext>
  );
};

export default App;
