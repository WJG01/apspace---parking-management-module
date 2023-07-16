/* eslint-disable eol-last */
export const parkingPositions = [
    {
        viewType: 'Desktop', parkinglocationtype: [
            {
                parkinglocation: 'APU-A',
                spots: Array.from(Array(20), (_, index) => {
                    if (index === 19) {
                        return {
                            parkingspotid: '20',
                            top: 35,
                            left: 430
                        };
                    }
                    return {
                        parkingspotid: String(index + 1).padStart(2, '0'),
                        top: 35 + (index * 33) + index * 5,
                        left: 638
                    };
                })
            },
            {
                parkinglocation: 'APU-B',
                spots: [
                    { parkingspotid: '01', top: 35, left: 638 },
                    { parkingspotid: '02', top: 68, left: 638 },
                    { parkingspotid: '03', top: 101, left: 638 }
                ]
            },
            {
                parkinglocation: 'APIIT-G',
                spots: [
                    { parkingspotid: '01', top: 35, left: 638 },
                    { parkingspotid: '02', top: 68, left: 638 },
                    { parkingspotid: '03', top: 101, left: 638 }
                ]
            }
        ]
    },
    {
        viewType: 'Mobile', parkinglocationtype: [
            {
                parkinglocation: 'APU-A',
                spots: Array.from(Array(20), (_, index) => {
                    if (index === 19) {
                        return {
                            parkingspotid: '20',
                            top: 35,
                            left: 150
                        };
                    }
                    return {
                        parkingspotid: String(index + 1).padStart(2, '0'),
                        top: 35 + (index * 15) + index *1.5,
                        left: 240
                    };
                })
            },
            {
                parkinglocation: 'APU-B',
                spots: [
                    { parkingspotid: '01', top: 35, left: 638 },
                    { parkingspotid: '02', top: 68, left: 638 },
                    { parkingspotid: '03', top: 101, left: 638 }
                ]
            },
            {
                parkinglocation: 'APIIT-G',
                spots: [
                    { parkingspotid: '01', top: 35, left: 638 },
                    { parkingspotid: '02', top: 68, left: 638 },
                    { parkingspotid: '03', top: 101, left: 638 }
                ]
            }
        ]
    }
];