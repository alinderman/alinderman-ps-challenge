/**
 * @module run.js - Calculates the optimal score of matches between
 * addresses and delivery drivers based on a proprietary algorithm
 */

const fs = require('fs');
const process = require('process')
const { primeFactors } = require('./utils/math.js')

// Regular expressios to extract street name from expected line input
const ADDRESS_RE = /^[\w]+\s([\w\s]+)\s[\w]+\,/i
// Regular expression to count vowels in driver name
const VOWEL_RE = /[aeiou]/ig
// Regular expression to count consonants in driver name
const CONSONANT_RE = /[bcdfghjklmnpqrstvwxyz]/ig
// List indices
ADDRESS_INDEX = 0
ADDRESS_FLAG_INDEX = 1
DRIVER_NAME_INDEX = 0
DRIVER_VOWEL_COUNT_INDEX = 1
DRIVER_CONSONANT_COUNT_INDEX = 2
DRIVER_FACTOR_INDEX = 3
DRIVER_FLAG_INDEX = 4
SCORE_INDEX = 0
SCORE_ADDRESS_INDEX = 1
SCORE_DRIVER_INDEX = 2


// Read input files
const addressFile = fs.readFileSync(process.argv[2], 'utf-8')
const driverFile = fs.readFileSync(process.argv[3], 'utf-8')

/*
 * Street names of addresses parsed from the input document.
 * 
 * Array of Arrays, one for each address, with the following
 * information for each:
 *    - {string} The street name
 *    - {boolean} Flag for determining when an optimal match
 *        has been determined for this address
 */
const addresses = []


/*
 * Full names of available delivery drivers
 * 
 * Array of Arrays, one for each driver, with the following
 * information for each:
 *    - {string} The full name
 *    - {number} The # of vowels in the name
 *    - {number} The # of consonants in the name
 *    - {Set} The prime # factors of the length of the driver's name
 *    - {boolean} Flag for determining when an optimal match
 *        has been determined for this driver
 */
const drivers = []


/*
 * The algorithmically calculated scores for each combination
 * of address and driver
 * 
 * Array of Arrays, one for each combination, with the following
 * information for each:
 *    - {number} The score for the combination
 *    - {number} The index of the address in the list of addresses
 *    - {number} The index of the driver in the list of drivers
 */
const scores = []

// Extract information from each document
addressFile.split(/\r?\n/).forEach(line =>  {
    addresses.push([line.match(ADDRESS_RE)[1], false])
});

driverFile.split(/\r?\n/).forEach(line =>  {
    const consonants = line.match(CONSONANT_RE)
    const vowels = line.match(VOWEL_RE)

    drivers.push([line, vowels.length, consonants.length, primeFactors(line.length), false])
});

// For each combination of driver and address, calculate the score
addresses.forEach((address, aIndex) => {
    const aFactors = [...primeFactors(address[ADDRESS_INDEX].length)]
    const aScores = []

    let even = address[ADDRESS_INDEX].length % 2 == 0
    drivers.forEach((driver, dIndex) => {
        let score = 0
        if (even) {
            score = driver[DRIVER_VOWEL_COUNT_INDEX] * 1.5
        } else {
            score = driver[DRIVER_CONSONANT_COUNT_INDEX]
        }
        if (aFactors.some(f => driver[DRIVER_FACTOR_INDEX].has(f))) {
            score = score * 1.5
        }
        scores.push([score, aIndex, dIndex])
    })
})

// Sort the entire list of scores from high to low
scores.sort((score1, score2) => {
    return score2[SCORE_INDEX] - score1[SCORE_INDEX]
})

// Iterate down the list of scores until all addresses have a driver.
// Starting from the highest score and working our way through the list
// until we find a unique combination for each address ensures we get 
// the highest possible score.
const assignments = []
let totalScore = 0
scores.forEach(score => {
    const addressIndex = score[SCORE_ADDRESS_INDEX], driverIndex = score[SCORE_DRIVER_INDEX]
    const address = addresses[addressIndex], driver = drivers[driverIndex]
    const addressReady = !address[ADDRESS_FLAG_INDEX],
        driverReady = !driver[DRIVER_FLAG_INDEX]

    if (addressReady && driverReady) {
        address[ADDRESS_FLAG_INDEX] = true
        driver[DRIVER_FLAG_INDEX] = true
        assignments.push([addressIndex, driverIndex])
        totalScore += score[SCORE_INDEX]
        console.log(`Assigning ${driver[DRIVER_NAME_INDEX]} to ${address[ADDRESS_INDEX]}: ${score[SCORE_INDEX]}`)
    }
})

console.log(`Max Score: ${totalScore}`)

