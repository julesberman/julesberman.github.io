# Stochastic Lifting for One-Step Per-Frame Video Generation and Physics Simulations

*By J. Berman, T. Blickhan, B. Peherstorfer*

---

> Stochastic Lifting (SL) turns next-frame video and physics-trajectory generation into a simple regression problem by randomly labeling frames with high-dimensional Gaussian labels. We show this "lifting" into a high-dimensional space, along with the strong relationship between successive frames, gives a sufficiently regular coupling to learn a generalizable transport map. Thus a single neural-network evaluation per frame then suffices to sample new trajectories—avoiding an expensive rearrangement step (i.e optimal transport) or an expensive multi-step dynamic transport process (i.e. diffusion models).

<div style="display: flex; justify-content: center; gap: 20px;">
  <img src="/blog/posts/sl_1.gif" alt="Stochastic Lifting" width="200">
  <img src="/blog/posts/sl_1.gif" alt="Stochastic Lifting" width="200">
  <img src="/blog/posts/sl_1.gif" alt="Stochastic Lifting" width="200">
</div>

---

## Motivation

Modern generative models (flow-based, diffusion-based) learn multi-step transformations that transport a reference distribution (usually noise) to data distributions. For sampling from static distrubtions, such as in image generation, this multi-step process is computationally tractable as it only need to be run once per sample.

For time-varying distributions, such as those found in physics simulation and video generation, auto-regressive diffusion models (ARDMs) proceed sequentially by sampling a new frame from a distributions conditioned on the previous frame, $\boldsymbol x_{t+1}\sim\rho(\cdot\mid \boldsymbol x_{t})$. 

Thus the multi-step process must be run once per frame, making accurate long term generation computationally intractable.

---

This paper asks a provocative question: **is the complexity of multi-step transport actually necessary for video generation?**

The conventional wisdom suggests yes—videos are higher-dimensional than images and inutively more complex, thus the additioal computatioal burden aligns with our intuition. But video generation has a unique property that other generation tasks lack: extremely strong conditioning from frame to frame.

Unlike generating unrelated images, consecutive video frames share a large part of their content. The transition from $\boldsymbol{x_t}$ to $\boldsymbol{x_{t+1}}$ involves small, localized changes:
- Objects move slightly
- Lighting changes gradually  
- New elements enter smoothly from frame boundaries

This suggests the source distribution (current frame) and target distribution (next frame) are already close in a meaningful sense. Thus it might be reasonable to expect that we can learn a one-step map from the current frame to the next frame: $F(\boldsymbol x_t) = \boldsymbol x_{t+1}$.

## A Naïve One-Step Map Fails
   ![one-to-many](/blog/posts/lifting_tikz.png)
1. **One-to-Many ambiguity**
   In stochastic dynamics the same $\boldsymbol x_t$ can lead to *many* different realizations of $\boldsymbol x_{t+1}$ (i.e. no *function* can exist which fits the data). Even if we consider two different but very close $\boldsymbol x_t$ and $\boldsymbol x_t'$, any reasonable smooth parametrization (such as a neural network) will not be able to fit the data.

2. **Deterministic collapse**
   In particular, minimizing a naïve MSE via  $||F(\boldsymbol{x_t})-\boldsymbol{x_{t+1}}||_2^2$

   forces $F$ toward $\mathbb E[\mathbf X_{t+1}\mid\mathbf X_t=\boldsymbol x_t]$. That is we learn the mean dynamic, rather than the stochastic one.



## The Stochastic Lifting Solution

This one-to-many problems motaivates the **stochastic lifting** solution. We resolve the one-to-many ambiguity by augmenting the training data with high-dimensional stochastic labels.

1. For each pair $(\boldsymbol{x_t^i}, \boldsymbol{x_{t+1}^i})$, assign label $\boldsymbol{\xi_t^i} \sim \mathcal N(0, I_d)$

2. Learn regression map $F_\theta$ that interpolates by minimizing: $$L(\theta)=\frac1{MT}\sum_{i=1}^{M}\sum_{t=0}^{T-1}||F_\theta\bigl(\boldsymbol{x_t^i},\boldsymbol{\xi_t^i} \bigr)-\boldsymbol{x_{t+1}^i}\||_2^2.$$

3. Generate new samples by evaluating $F_\theta$ with fresh labels:
$ \boldsymbol{x ̃_{t+1}} = F_\theta(\boldsymbol{x_t}, \boldsymbol{\xi_t})$ where $\boldsymbol{\xi_t} \sim \mathcal N(0, I_d)$

## How is this possible?

At first glance, it is unclear why stochastic lifting would work. We take an under-determined system and add inputs which are (by design) totally independent from the output. Intuitively, because the labels contain no information about the output, the network should ignore them. Yet in practice, the network not only learn a function which depends on the the labels $\boldsymbol{\xi_t}$, but one that also meaningfully generalizes in a distributional sense when evulated on new labels $\boldsymbol{\xi_t'}$.

Our key insight is that if our function both **interpolates** and is **smooth**, then we can expect it to generate samples that are close to the true distribution. In paticular see proposition 1 in the paper:

$$WWW$$

How does stochastic lifting enable smoothness and interpolation?

1. **Random labels allow for interpolation**: By assigning unique high-dimensional labels to training data, we convert the one-to-many mapping problem into a well-posed regression problem. This allows us to interpolate the data.

2. **High dimensions enable smoothness**: Lifting to higher dimensions makes interpolation easier and ensures $F$ is smoother (lower Lipschitz constants).

3. **Frame conditioning provides structure**: The strong conditioning from $\boldsymbol x_t$ means we don't need to learn transport from arbitrary distributions. From a smoothness perspective the fact that $\boldsymbol x_t$ is close to $\boldsymbol x_{t+1}$ means our interpolating $F$ is smooth.

## Empirical Evaluation
<div style="display: flex; justify-content: center; gap: 10px;">
  <img src="/blog/posts/SI_fvd.png" alt="fvd" width="350">
  <img src="/blog/posts/qoi.png" alt="qoi" width="200">
</div>

 - Physics roll‐outs (wave equation, two‐phase flow): one‐step Stochastic Lifting matches or surpasses 40‐step diffusion baselines in matching the distrubition of physical quantites of interest.

 - BAIR robot‐pushing (64×64): Fréchet Video Distance (FVD) = 74.8—best among all published single‐step models and within 5 % of multi‐step diffusions.

 - Scalability: Generates 32 frames of 480×480 video in 0.96 s on a single H100 GPU.

 ## Limitations and Future Work

The results may seem too good to be true. Does this mean we can simply fit a neural network directly with uncoupled noise to data and expect it to generalize?

The answer is no. We critically build on the strong coupling given by the pair of current and next frame in the training data. Importantly, as stated before, this strong coupling ensures that an interpolating map will also be smooth. 

If the source and the target distributions are "far apart" (as in image generation) then the interpolating map will necessarily be irregular. This means, for example, that Stochastic Lifting fails when aiming to directly learn a map from noise to images. 

---

*Code & datasets:* *link redacted*
*Citation:* *see paper.*
