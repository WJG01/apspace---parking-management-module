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
                spots: Array.from(Array(20), (_, index) => ({
                    parkingspotid: String(index + 1).padStart(2, '0'),
                    top: 150 + (index * 28),
                    left: 190
                }))
            },
            {
                parkinglocation: 'APIIT-G',
                spots: Array.from(Array(20), (_, index) => ({
                    parkingspotid: String(index + 1).padStart(2, '0'),
                    top: 420 + (index * 33) + index * 4,
                    left: 630
                }))
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
                            top: 37,
                            left: 170
                        };
                    }
                    return {
                        parkingspotid: String(index + 1).padStart(2, '0'),
                        top: 35 + (index * 15) + index * 4,
                        left: 275
                    };
                })
            },
            {
                parkinglocation: 'APU-B',
                spots: Array.from(Array(20), (_, index) => ({
                    parkingspotid: String(index + 1).padStart(2, '0'),
                    top: 106 + (index * 15) + index * 2,
                    left: 35
                }))
            },
            {
                parkinglocation: 'APIIT-G',
                spots: Array.from(Array(20), (_, index) => ({
                    parkingspotid: String(index + 1).padStart(2, '0'),
                    top: 193 + (index * 14) + index * 0.5,
                    left: 253
                }))
            }
        ]
    }
];