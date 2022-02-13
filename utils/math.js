/**
 * @module math.js
 */

/* Internal state */

/* Memoize any previously verified prime numbers */
const knownPrimes = new Set()

// Our naive method of checking possible prime numbers can't tell us about 2 or 3
knownPrimes.add(2)
knownPrimes.add(3)

/* Track the highest prime number we have yet encountered */
let maxPrime = 0


/**
 * Locates all unique prime factors for an input
 * 
 * Based on the principal that all prime numbers are of the form 6n + 1 or 6n - 1. This gives us a concrete
 * set of numbers to check (besides all of them), but only tells us if a number _might_ be prime.
 * By recursively checking each possible prime to see if it also has a prime factor, we can validate. 
 * From there we can make note of each we come across to avoid repeating calculations.
 * 
 * @arg {number} num - the number to generate factors for
 * @arg {boolean} [first] - whether to return when the first factor is identified; used in recursive calls to 
 *     short-circuit as it's only necessary to know if the input itself is prime
 * 
 * @returns {Set} the unique set of prime factors of the input
 */
function primeFactors(num, first = false) {
    const factors = new Set()

    // We don't want to include 1 as every number will have it.
    if (num == 1) {
        return factors
    }

    // Check against 2 and 3 as those can't be calculated
    if (num % 2 == 0) {
        factors.add(2)
        if (first) {
            return factors
        }
    }

    if (num % 3 == 0) {
        factors.add(3)
        if (first) {
            return factors
        }
    }

    // Starting at 5, calculate and verify any possible primes that are lower than the input
    if (num > 4) {
        let base = 0,
            pivot = 0,
            primeLow = 0,
            primeHigh = 0

        do {
            // For every integer n, there is a possible prime at 6n +/-
            base++
            pivot = 6 * base
            primeLow = pivot - 1
            primeHigh = pivot + 1

            const checkPrime = (primeCandidate) => {
                // A possible prime must be prime if we haven't already encountered a factor
                let isDefinitelyPrime = factors.size == 0 && num == primeCandidate

                if (!isDefinitelyPrime) {
                    // This is a possible prime, but it's not equal to the input. Recursively check
                    // if this possible prime has any prime factors (besides itself)
                    let secondaryFactors = primeFactors(primeCandidate, true)

                    // If we got only one factor back, and it's the possible one we passed in, we know for sure
                    isDefinitelyPrime = secondaryFactors.size == 1 && secondaryFactors[1] == primeCandidate
                }

                if (isDefinitelyPrime) {
                    // Remember so we don't check it again and set the bar for the next check
                    knownPrimes.add(primeCandidate)
                    if (primeCandidate > maxPrime) {
                        maxPrime = num
                    }
                }
            }

            // If this is a prime number we haven't checked before, validate whether it is prime
            if (primeLow > maxPrime) {
                checkPrime(primeLow)
            }
            if (primeHigh > maxPrime) {
                checkPrime(primeHigh)
            }

            // Now we can be sure if one of those 2 candidates are prime, they are in knownPrimes, so check if
            // either one is a factor of the input
            if (num % primeLow == 0 && knownPrimes.has(primeLow)) {
                factors.add(primeLow)
                if (first) {
                    return factors
                }
            }
            if (num % primeHigh == 0 && knownPrimes.has(primeHigh)) {
                factors.add(primeHigh)
                if (first) {
                    return factors
                }
            }
        } while (primeHigh < num)
    }

    return factors
}

module.exports = {
    primeFactors
}