# Platform Science Code Exercise
### Adam Linderman

#### Language
Javascript - Chosen for familiarity; one of the goals of the exercise is to be able to finish it :smile:, so a 
language that required the least learning curve was desirable. It requires more diligence to manage code clarity,
but the need to provide a simple, performant solution made it suitable. Additional requirements around scale or
extensibility might cause a different decision.

#### Approach
After reading through the requirements, I identified the primary components necessary to solve the problem:

    - Calculate a score based on the described algorithm for each combination
    - Calculate the optimum score of all the possible matches
    
As the latter is difficult to do without the former, initial work went into breaking down the ability to calculate the
scores. There are a few pieces of information we will potentially need to know:

    - If the address length is even or odd
    - How many vowels are in the driver's name
    - How many consonants are in the driver's name
    - Common factors between the length of the address and driver's name
    
The first 3 are relatively trivial to calculate, so the main thing to figure out was how to calculate common factors
of 2 numbers. The naive way to do this is to calculate all factors for each number, but that would leave a high
chance that we'll do more calculation than is necessary. Ideally, when comparing numbers, we could stop as soon as 
we figured if there was a factor between the two at all. My first approach to this was to start as low as possible and 
simply continue to check numbers until we find one that is a factor of both numbers (ie if 2 goes into both we can
stop there, then try 3, etc). It was clear pretty quickly that only prime number factors would really matter, so
expanding on my original idea, simply working up through the primes until we find one that goes into both and is lower
than both numbers should be a workable solution.

The obvious trouble here is that there is no formula for calculating all primes. We could conceivably just use a 
maintained list, but our solution should not be limited by input size, though in practice that would definitely be a 
more performant solution with predictable input sets. By working with a fixed set of prime numbers, there would exist 
the chance that we'd run into an input that required a prime outside our list. That means the solution would need to be 
able to check primes as high as necessary. Luckily, there is a well-known way to calculate a series of all numbers that 
_might_ be prime; the formula 6n +/- 1. We should be able to validate any possible prime is actually a prime using
prime factorization; we should be able to use the same process of checking possible primes against our list of
already-known primes by seeing if they have any other prime factors.

In order to maintain the performance of the solution, I took special care to make sure I wasn't checking possible primes
more than once by keeping a list of validated primes, and by keeping track of what possible ones we had already checked.
Checking a possible prime is an actual prime is an exponentially complex operation, so ensuring we're not repeating
calculations ensures the solution is as flexible as it could need to be without any more overhead than is necessary.

Now that we can handle determining all of the required info, the next step is to actually parse the content, iterate
over the combinations and calculate all of the scores based on the formula. Once we have all of them, we need a way to
determine what the highest score we could get is. I went through a few problematic solutions around this, mostly 
running into issues with the possibility that we might get _a_ high score, but not _the_ high score. The solution
I ended up with involves simply checking each score from highest to lowest, selecting scores that did not repeat
either a driver or an address.

#### Assumptions

- Only the street name matters
- Addresses are in the file in the format of "123 Streetname Street, City, State, Zip", 1 per line
- Driver's full name is in the file, 1 per line
- The driver's full name is used for counting vowels/consonants
- The driver's full name (space included) is used in calculating the factors of it's length
- Scores that are equal are considered consistently, but not in any specific order

### Instructions
1. Install [node](http://nodejs.org)
2. Check out project
3. `cd` into project directory
4. Run the command `node run.js <path-to-address-file> <path-to-driver-file>`
5. If successful, you should see output similar to this:
```
Assigning DriverA to StreetA: 13.5
Assigning DriverB to StreetB: 12.5
Max Score: 26.0
```

#### Next Steps
There are a few areas I would start to look at to continue to productionize this solution -

- I think my max scoring solution still has a flaw; the last assumption I made I think could lead to inaccurate max
scores. I found handling ties to be tricky. A simply but possibly not-as-fast-as-it-could-be solution would be to 
calculate all possible scores; obviously this would be a bulletproof way to get to the right answer, but I think there
is still potential in the approach that I took, but maximizing downstream selections when ties occur was tricky. I
feel like it's pretty likely that there is a well-known solution for a problem like this, but in the research I did I
could not find one easily. Continuing to research the topic would probably be my next step.
- I do not think that regular expressions are the most performant way to calculate the number of vowels/consonants, but
it was simple to implement, and should not add significant complexity to the run time, so I stayed with it. I think
a simpler check with character ranges would probably be quicker, but potentially less easy to maintain.
- As mentioned, I don't think Javascript is the best language for this at scale; depending ont he volume of 
data sets/frequency of calculation, I think there's probably a variety of ways that could be ideal. Seems unlikely that
we'd be ingesting data via command line arguments, so factors like that are probably as, if not more, important than
what the best language for readability/maintainability is.
- I do not think it makes a ton of sense to calculate prime numbers on the fly if this was going to be a production
level system. I think it's perfectly reasonable given that we're not likely to run into enormous names/addresses
to simply use a well-known list. It would eliminate a fair amount of the code that simply manages whether we know if a
number is prime or not, let alone the code that actually calculates if they are.

Thanks for reading!