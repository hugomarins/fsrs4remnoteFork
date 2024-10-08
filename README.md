# DSR Scheduler: A FSRS4RemNote fork

DSR Scheduler is a fork of [FSRS4RemNote](https://github.com/open-spaced-repetition/fsrs4remnote).

FSRS4RemNote is a custom scheduler plugin for RemNote implementing the Free Spaced Repetition Scheduler, based on the [DSR](https://supermemo.guru/wiki/Two_components_of_memory) (Difficulty, Stability, Retrievability) model proposed by [Piotr Wozniak](https://supermemo.guru/wiki/Piotr_Wozniak), polish researcher author of SuperMemo and pioneer is SRS, devoped into the DHP (Difficulty, Half-life, Probability of recall) model introduced by [Jarrett Ye](https://dl.acm.org/profile/99660547150) in the paper: [A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling](https://www.maimemo.com/paper/).

The scheduler is based on a variant of the DSR  model, which is used to predict memory states. The scheduler aims to achieve the requested retention for each card and each review.

(Read this Read Me file on [GitHub](https://github.com/hugomarins/fsrs4remnoteFork) for better visualization.)

DO NOT USE FSRS OPTIMIZER TO OBTAIN YOUR WEIGHTS (as this Fork changes the formula for calculating new stability, so that there is no direct correspondence of the standard FSRS weights and the weights of this fork).

# DSR Scheduler changes to standard FSRS4RemNote behavior

The formulas for new stability after recall and new stability after forgetting have been reshaped, in order to ensure $w8$ and $w12$ really modulates the retrievability weight on the next stability. 

Increasing $w8$ (coupled with decreasing $w6$) can ensure the same behavior of stability increase for cards reviewed on due dates, but make the stability increase in case of recall less aggressive for very overdued cards.

$$S^\prime_r(D,S,R) = S\cdot(e^{w_6}\cdot (11-D)\cdot S^{w_7}\cdot(e^{(1-R^{w_8})}-1)+1)$$

$$S^\prime_f(D,S,R) = w_9\cdot D^{w_{10}}\cdot S^{w_{11}}\cdot e^{(1-R^{w_{12}})}$$

This change is **relevant specially for those who have a large backlog and decks that have been stale and dormant for a very large period**. I hope this will help you catch up on your backlog. More about this will be said when explaining $w8$ [setting](##New-Stability-after-RECALL).

Also, the distinction between new stability and new interval was removed. New Stability after rating "Hard" has been corrected to be the `last stability * hard interval`; and new Stability after rating "Easy" has been corrected to be the `Next_recall_stability * EasyBonus`. This is to avoid the FSRS strange behavior of, after rating "Hard", on next review the proposed next interval in case of pressing "Hard" once more being too long, almost the same of that of pressing "Good". The inverse situation happened when "Easy" was pressed (pressing Easy subsequently would give a next Stability smaller than it should).

Another change is that for *new cards*, learning steps can now be set in `Settings > Custom Schedulers`. Default parameters are:
- 1 min after rating "Again";
- 10 min after rating "Hard";
- 1 day after rating "Good".
(rating "Easy" jumps the learning phase and yet give the Easy Bonus; the card will receive an interval of $(w_0 + (3 \cdot w_1)) \cdot \text{Easy bonus}$, around 11 days using default settings)

# Concepts and underlaying principles

- *Retrievability* is the probability of recall (memory's retrieval strength).The lower it is, the higher the probability that the memory will be forgotten.

    retrievability of $t$ days since the last review:

    $$R(t,S) = 0.9^{\frac{t}{S}}$$

    where $R(t,S)=0.9$ when $t=S.$

- *Stability* is the storage strength of memory (interval when R=90%). The higher it is, the slower it is forgotten. It is the number of days it takes for the retention to decay from 100% to 90%. It is analogous to the concept of ideal next interval in Anki.

    - *Memory stabilization*: increase in memory Stability as a result of the retrieval of a memory (e.g. in review). (abbreviated SInc for stability increase in SuperMemo)

    - *Stabilization decay*: gradual decrease in the potential to increase memory Stability with review as stability increases. This means that durable memories cannot be easily made more durable. Stability tends to saturate.

- *Difficulty* is how hard it is to maintain a memory of something. The higher the difficulty, the harder it is to increase its Stability and maintain it long term. The larger the number, the greater the difficulty. Its value ranges from 1 (easiest) to 10 (hardest).

- Memory laws considered:
    - The more complex the memorized material, the lower the Stability increase.
    - The higher the Stability, the lower the stability increase (Stabilization decay)
    - The lower the Retrievability, the higher the Stability increase. (But it does not mean that a memory can be considered Stable without a consistent review history!)

# Setting the Weights

## Initial Stability
- $w0$ is the initial Stability when the first rating is "Again" (**Initial Stability for Again answer**). (Default: `1`)

- $w1$ (default: `3`; recomended: 2.5~3) is the **Initial Stability Step per rating** and will set the initial Stability when the first rating is other than "Again", by the formula:
    
    $$S_0(G) = w_0 + (G-1) \cdot w_1$$
    
    where  
    $S_0$ is the initial Stability, and  
    $G$ is the "Grade" (1 - Again; 2 - Hard; 3 - Good; 4 - Easy).
    
    > This means that, using Default values, after the first rate, you'll get a initial Stability (first interval) of about:
    - 7 days for Good, 
    - 4 days for Hard, 
    - 13 days for Easy (10 days * easy bonus),
    - and 1 day for Again (after the completion of the Again step, 1 min default).

## Initial Difficulty
- $w2$ is the initial Difficulty when the first rating is "Good" (**initial Difficulty for Good answer**). (Default: `5`)

- $w3$ (always negative; default: `-1.5`) is the **Initial Difficulty Step per rating** and modulates how much the Difficulty will be changed if first rating is not "Good", by the formula:
    
    $$D_0(G) = w_2 + (G-3) \cdot w_3$$

    where  
    $D_0$ is the initial Difficulty, and  
    $G$ is the already mentioned "Grade" (1 - Again; 2 - Hard; 3 - Good; 4 - Easy).

    So, it modulates:
    - how much Difficulty will decrease if rating is "Easy";
    - and how much Difficulty will increase if rating is "Hard".
    - Difficulty will increase twice as much if rating is "Again".

    > This means that, using Default values, after the first rate, you'll get a initial Difficulty of:
    - 7.1 for Again, 
    - 5.6 for Hard, 
    - 4.1 for Again,
    - 2.6 for Easy.


## New Difficulty after review
The *new Difficulty after review* is modulated by two weights: 
    
- $w4$ (always negative; default: `-1.5`) is the **Next Difficulty Step per rating** and is similar to $w3$, but modulates how much the Difficulty will be changed after a review (instead of after the first rating), by the formula:

    $$D^\prime = D + w_4 \cdot (G - 3)$$

    where  
    $D^\prime$ is the new Difficulty after review,  
    $D$ is the current Difficult (before the review) and  
    $G$ is the already mentioned "Grade" (1 - Again; 2 - Hard; 3 - Good; 4 - Easy).

    So, it modulates:
    - how much Difficulty will decrease if rating is "Easy";
    - and how much Difficulty will increase if rating is "Hard".
    - Difficulty will increase twice as much if rating is "Again".
    
- But the new Difficult will be set only after applying the **Next Difficulty Reversion to Mean Speed**, used to **avoid "ease hell"**, modulated by $w5:$

    $$w_5 \cdot D_0(3) + (1 - w_5) \cdot D^\prime$$

    where  
    $w_5$ is the mean reversion factor (to avoid "ease hell"),  
    $D_0(3)$ is the initial Difficulty when first rating is "Good" (Grade = 3), and  
    $D^\prime$ is the new Difficulty after review shown above.

    The $w5$ default value of `0.2` means that only 80% of $D^\prime$ will be steady (unless you rate other than Good), but the remaining 20% will balance the Difficulty, making it tend to approach again the standard Difficulty (set in $w2$) asymptotically.

    > **Ease Hell** is when a Spaced Repetition Software thinks your flashcard is more difficult than it actually is, causing you to review that card more than necessary, in too short intervals. If you rated that card Again and Hard some times, the SRS tends to set a high Difficulty for that card, making the intervals too short. But even if you did rate Again and Hard some times, at a given point that memory tends to be ingrained well enought, converging to the mean state (or mean "speed") of the rest of your knowledge material, and there will be no need of shorter intervals anymore. That's why applying this *mean reversion* is important. 
    So, using default values, if your first rating for a card is Again, the initial Difficulty will be 7.1. But if in your next reviews you always press Good, the Difficulty will decrease sucessively to 6.5, 6, 5.6, 5.3... (and the intervals will become larger, more similar to those of the rest of your cards).
    
So, the formula for the new Difficulty after review (as a function of current Difficulty before review and the Grade rated in the review) is:

$$D^\prime(D,G) = w_5 \cdot D_0(3) +(1 - w_5) \cdot (D + w_4 \cdot (G - 3))$$

where  
$D^\prime$ is the new Difficulty after review,  
$D$ is the current Difficult (before the review),  
$w_5$ is the mean reversion factor (to avoid "ease hell"),  
$D_0(3)$ is the initial Difficulty when first rating is "Good" (Grade = 3),  
$G$ is the "Grade" (1 - Again; 2 - Hard; 3 - Good; 4 - Easy), and  
$w_5$ is the factor that modulates how much the Difficulty will be changed after a review.

## New Stability after RECALL
The *new Stability after recall* is a function of Difficulty, current Stability and of the Retrievability, and is modulated by three weights:
- $w6$ is the "**recall factor**" (**Next Stability Factor after success**) (default: `0.25`), and *increases exponentially the next Stability* (that is, the next interval):

    $$S^\prime_r(D,S,R) = S\cdot(\boxed{e^{w_6}}\cdot (11-D)\cdot S^{w_7}\cdot(e^{(1-R^{w_8})}-1)+1)$$

    Remember that the natural exponential function $y=e^x$ behaves in the following manner:
        
    ![](https://raw.githubusercontent.com/hugomarins/fsrs4remnoteFork/main/public/Exp.svg) 

- $w7$ (always negative; default: `-0.41`) is the factor for the "**recall Stability decay**" (**Next Stability Stabilization Decay after success**), modulating the **marginal effect on the memory consolidation decay**:

    $$S^\prime_r(D,S,R) = S\cdot(e^{w_6}\cdot (11-D)\cdot \boxed{S^{w_7}}\cdot(e^{(1-R^w_8)}-1)+1)$$

    The larger the $S,$ the less the $SInc$ (Stability increase factor; = Anki's factor), which means the marginal effect on memory consolidation. In other words, the Stability (intervals) increases faster when the intervals are still short, but reduces the speed of increasing as the memory gets stable and intervals larger (that is a point in which the curve "flattens").

    The more negative $w7$ is, the less the intervals of very mature cards will increase.
        
    [Here](https://www.geogebra.org/calculator/kyqjdspc) you can see in Geogebra the effect of $w7$.

    ![](https://raw.githubusercontent.com/hugomarins/fsrs4remnoteFork/main/public/w7.png)

    This sets a great advantage of FSRS & DSR Scheduler over standard Anki-SM2, to which this multiplication factor is almost constant, making intervals extremely large for very mature cards, increasing the chances of forgetting, as they do not consider the decay in memory consolidation!

    > [Stabilization decay](https://supermemo.guru/wiki/Stabilization_decay), as defined by **Piotr Woźniak**, is a gradual decrease in the potential to increase memory stability with review as stability increases. This means that durable memories cannot be easily made more durable. Stability tends to saturate.
    
- $w8$ is the **Next Stability Retrievability Gain after success Limiter** (default: `9.3`), moderating *how Retrievability affects stabilization*:

    $$S^\prime_r(D,S,R) = S\cdot(e^{w_6}\cdot (11-D)\cdot S^{w_7}\cdot\boxed{(e^{(1-R^{w_8})}-1)}+1)$$

    Retrievability is given by:

    $$R(t,S) = 0.9^{\frac{t}{S}}$$

    considering $t$ days since last review.

    So, $R(t,S)=0.9$ when $t=S$, that is, when the card is reviewed is its due date. But Retrievability:
    - Decreases if the card is overdued (reviewed later than scheduled)  
        0,82 if $t$ days elapsed are double the scheduled Stability.

    - Increases if the card is reviewed before the due date.  
        0,95 $t$ days elapsed are half the scheduled Stability.
        
    The less the Retrievability $R,$ the larger the $SInc$ (Stability increase factor; = Anki's factor), in order to achieve the **desirable difficulty**. 

    > [Desirable difficulty](https://supermemo.guru/wiki/Desirable_difficulty) states that obstacles in learning lead to better learning, and that a learning task that requires a considerable but desirable amount of effort improves long-term performance. If your cards are too easy to review, reviewing them will get boring and the strengthening process achieved by successful recall will be less than if you adjust the difficulty, increasing the chalangeness of the reviewing process.

    In other words, if I recalled even when it was not that probable anymore (an overdued card), I can suppose the memory is more stable than initially anticipated. So, the Stability increase can be larger.

    Looking at the formula, we can see that the larger the Retrievability, the more the power of "e" approaches zero, and as can be seen in the graph of the exponential function $y=e^x$ above, $e^0 = 1$, and the $w8$ term as a whole would be zero (that is, there would be no Stability increase if I review the card again in the same day I have already reviewed). But as the Retrievability decreases, the power of "e" approaches 1 and the term increases:

    ![](https://raw.githubusercontent.com/hugomarins/fsrs4remnoteFork/main/public/w8_term.png)

    $w8$ therefore modulates this effect of Retrievability on next Stability (by which rate reviewing after or before the due date will increase / decrease next Stability, respectively). It can be considered as a **limiting factor**, as the larger it is, the less the Stability of overdued cards will increase.

    You can see the effect of changing $w8$ (and compare with the effect of doing this in FSRS) in Geogebra [here](https://www.geogebra.org/calculator/kbqchnep). The graph is on a bases of "overdueness", in which 1 means that $t=S$, 2 that $t=2S$ (the real interval was twice the scheduled interval), and so on.

    By increasing $w8$, you can limit the increase of Stability in case of very overdued cards (it must be done together with decreasing $w6$).
    - Using a $w8$ of 9.3, the **overdue bonus** (that is, how much the next Stability will be increased because I reviewed late and yet recalled, in relation to that I would obtain if I had reviewed in the due date) will never be grater than 2. So, if I had a card with stability of 10 days, and reviewed it only after 100 days, the next Stability will be only twice as large as that if I had reviewed on scheduled date.
    - In standard setting of FSRS, the overdue bonus for this same situation would be much larger (greater than 8). And if I had reviewed that same card (10 days of Stability) only after one year, the overdue bonus would be grater than 14!
    - As I don't believe we can suppose that memory is that stable without a consistent review history, I made in DSR Scheduler these changes to the behavior of FSRS Scheduler, to give a bonus for overdueness, but limit it to reasonable figures.

    ![](https://raw.githubusercontent.com/hugomarins/fsrs4remnoteFork/main/public/overdue_bonus.png)

## New Stability after FORGET
The *new Stability after FORGET* is similarly a function of Difficulty, current Stability and of the Retrievability, and is modulated by the last four weights:

- $w9$ **forget linear factor** (**Next Stability Factor after failure**) (default: `1.2`).
    
    The larger it is, the less will be the penalty for having forgot, and the greater will be the new Stability (you won't have to start all over again). Thus, if you do not think that a lapse means that you have to do all the job again (if you believe the memory traces are still there, even though needing to be reinforced), do not use a too small figure here.

- $w10$ **forget Difficulty decay** (**Next Difficulty Decay after success**) (always negative, default: `-0.2`),

    If $w10$ is zero, $D^{w10}$ is one, independent of the Difficulty value (the $w10$ term would not affect the new Stability). When the negative figure is increased, however, the term $D^{w10}$ will give lower results for larger Difficulties (next to 10) and higher values for the easy stuff (D next to 1). The larger $w10$, the more Difficulty will influence the decay of the new Stability (that it, the more the new Stability will be decreased for the hard stuff, while not that much if the stuff is easy).

    You can see the effect of $w10$ in Geogebra [here](https://www.geogebra.org/calculator/kge5warg).

- $w11$ **forget Stability Gain** (**Next Stability 'Stability Gain' after failure**) (default: `0.5`). 
    
    If it was 1, next Stability after failure would increase linearly with previous Stability; by setting a value lower than 1, there will be a limit for this increase in next stability, and very mature cards will not have too long next Stability after failure.

- $w12$ **forget Retrievability Gain** (**Next Stability 'Retrievability Gain' after failure**) (default: `9.3`).

$$S^\prime_f(D,S,R) = w_9\cdot D^{w_{10}}\cdot S^{w_{11}}\cdot e^{(1-R^{w_{12}})}$$

You can play the function in Geogebra [here](https://www.geogebra.org/calculator/rfjvmmpu).

# Default parameters & Comparison DSR Scheduler x Anki 

***Default parameters***: [`1, 3, 4.1, -1.5, -1.5, 0.2, 0.25, -0.41, 9.3, 1.2, -0.2, 0.5, 9.3`]

**Caveat**: Unlike FSRS suggested parameters, that were preceded of extensive study, primarily with language learners databases, and that focus on achieving the desired retrievability, the default parameters suggested above are focused in giving a desired behavior of intervals that meet my needs in studying specific educational material, tested only in myself, and that I suppose can be extrapolated to normal educational material (but not for learning vocabulary of foreign languages). The focus is to give higher intervals (than in Anki behavior) when the card is yet young, but after the card being very mature, avoid too large intervals, allowing for the stabilization decay explained in the Concepts section above.

The intervals if always rating "Good" for the first 10 repetitions (including learning steps) is shown below. Those of default settings for Anki and for FSRS are also shown for comparison:

DSR Scheduler's intervals: `1d, 7d, 31d, 3m, 6.6m, 1y, 1.7y, 2.7y, 3.9y, 5.4y` (10 repetitions covering 15.5 years)

Anki's intervals: `10min, 1d, 3d, 8d, 20d, 1.7m, 4.2m, 10.4m, 2.1y, 5.4y` (10 repetitions covering 8.9 years)

FSRS's intervals: `10min, 3d, 8d, 21d, 1.7m, 3.8m, 8.2m, 1.4y, 2.7y, 5.1y` (10 repetitions covering 10.4 years)


Considering the case of always rating "Good" (Difficulty = 5), these default parameters would be compared with Anki ease factor (multiplication factor by which the current interval will be increase) as show below:

![](https://raw.githubusercontent.com/hugomarins/fsrs4remnoteFork/main/public/anki_factor_comparison.png)

Where the graph shows the factor on a basis of current Stability.

The graph shows that this scheduler allows for the Stabilization decay, what is impossible to Anki (that always multiply the previous interval by the same ease factor).

Yet, you can have much larger intervals in the beginning (young cards), spending less time with reviews that you don't need.

You can play with other settings in Geobebra [here](https://www.geogebra.org/calculator/qdgnh2ab).

## Usage

- Install the plugin from the RemNote plugin marketplace by using the link https://www.remnote.com/plugins/fsrs4remnoteFork.
- Open the settings page and click on [Custom Schedulers].
- Choose to use "DSRscheduler" on the "Scheduler Type" dropdown menu (as your Global Default Scheduler or any other scheduler).