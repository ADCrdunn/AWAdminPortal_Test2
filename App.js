import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, SafeAreaView, Dimensions } from 'react-native';

import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart,
  } from 'react-native-chart-kit';

import * as DataProv from "./data_provider";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    backgroundGradientFrom: '#eff3ff',
    backgroundGradientTo: '#efefef',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(80, 80, 80, ${opacity})`,
    strokeWidth: 0, // optional, default 3
    barPercentage: 0.8,
    useShadowColorFromDataset: false // optional
};

const getChartWidth = () => {
    if (screenWidth > 400) {
        return screenWidth / 3;
    } else {
        return screenWidth / 1.5;
    }
};

function ConnectedDisconnected() {
    const [connected, setConnected] = useState([]);
    const [disconnected, setDisconnected] = useState([]);

    const handleNewData = (devices) => {
        let connectedDevs = [];
        let disconnDevs = [];
        for (let d in devices) {
            if (devices[d].status != 99) {
                connectedDevs.push(d);
            } else {
                disconnDevs.push(d);
            }
        }

        setConnected(connectedDevs);
        setDisconnected(disconnDevs);
    };

    useEffect(() => {
        // subscribe to our data provider
        DataProv.subscribe(handleNewData);
    }, [])


    let data = {
        labels: ["Connected", "Disconnected"],
        datasets: [
            {
                data: [connected.length, disconnected.length],
                colors: [() => "green", () => "red"]
            }
        ]
    };

    return (
        <View style={styles.chartWrap}>
            <Text style={styles.header}>Connection Status</Text>
            <BarChart
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                
                data={data}
                width={getChartWidth()}
                height={200}
                chartConfig={chartConfig}
                yAxisInterval={10}
                segments={3}
                yLabelsOffset={35}
                withCustomBarColorFromData
                flatColor
                fromZero
                withInnerLines
                showValuesOnTopOfBars
            />
        </View>
    );
}

function VersionPieChart(props) {
    const [versionCounts, setversionCounts] = useState([]);

    let versionProp = "";
    let chartTitle = "";
    if (props.processor == "ESP") {
        versionProp = "espFwRevision";
        chartTitle = "ESP32 Firmware";
    } else {
        versionProp = "TiFwRevision";
        chartTitle = "MSP430 Firmware";
    }

    const handleNewData = (devices) => {
        let counts = {};




        for (let d in devices) {
            let thisVers = devices[d].system[versionProp];

            if (!thisVers) {
                thisVers = "  Unknown";
            } else {
                thisVers = "  v" + thisVers;
            }

            if (counts[thisVers] == null) {
                counts[thisVers] = 1;
            } else {
                counts[thisVers] += 1;
            }
        }

        let colorMap = ["gray", "red", "blue", "green", "yellow", "cyan"]

        let countsArr = Object.keys(counts).map((vers, idx) => {
            return {
                name: vers,
                count: counts[vers],
                color: colorMap[idx],
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
            };
        })

        setversionCounts(countsArr);
    };

    useEffect(() => {
        // subscribe to our data provider
        DataProv.subscribe(handleNewData);
    }, [])

    return (
        <View style={[styles.chartContainer]}>
            <Text style={styles.header}>{chartTitle}</Text>
            <View style={[styles.chartWrap, {backgroundColor: "#eff3ff"}]}>
                <PieChart
                    accessor="count"
                    data={versionCounts}
                    width={getChartWidth()}
                    height={150}
                    chartConfig={chartConfig}
                    backgroundColor={"#FFFFFF00"}
                    withCustomBarColorFromData
                    flatColor
                    absolute
                />
            </View>
        </View>
    );
}

function SideBySideOrStacked(props) {
    if (screenWidth > 400) {
        return (
            <View style={{flexDirection: "row"}}>
                {props.children}
            </View>
        )
    }
    else {
        return props.children;
    }
}


function Dashboard() {
    return (
        <View style={{flex: 1, margin: 8, alignItems: "center"}}>
            <ConnectedDisconnected/>
            <SideBySideOrStacked>
                <VersionPieChart processor="ESP"/>
                <VersionPieChart processor="MSP"/>
            </SideBySideOrStacked>
        </View>
    );
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Demo AWACS Admin</Text>
      <StatusBar style="auto" />
      <ScrollView>
          <Dashboard/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  chartContainer: {
    marginHorizontal: 25,
    marginBottom: 25,
  },
  chartWrap: {
    padding: 10,
    borderRadius: 20
  },
  header: {
    textAlign: 'center',
    fontSize: 18,
    padding: 16,
  },
});
