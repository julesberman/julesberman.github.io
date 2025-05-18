# Stochastic Lifting for One-Step Per-Frame Video Generation and Physics Simulations

*By J. Berman, T. Blickhan, B. Peherstorfer*

---

> Stochastic Lifting (SL) turns next-frame video and physics-trajectory generation into a *simple regression* problem by randomly “lifting’’ every frame into a higher-dimensional space.  A single neural-network evaluation per frame then suffices to sample new trajectories that match ground-truth distributions in Wasserstein-2 distance—without diffusion-style multi-step transport.

---

## 1 Motivation

Modern generative models (score-based diffusion, normalizing flows, autoregressive diffusion, …) learn **multi-step transports** that move a *reference* distribution (usually noise) to data distributions \[sohl-dickstein ±15; Song ±20; Albergo ±23].
While powerful, these *rearrangement* procedures are:

* **Slow at inference**—each frame may need tens–thousands of NN calls.
* **Overkill for sequential data** (videos, stochastic PDEs) where a **strong natural coupling** already exists between successive frames $(\mathbf x_t,\mathbf x_{t+1})$.

The key question: *Can we skip the expensive transport and still generate diverse, realistic next frames in one step?*
*Stochastic Lifting says yes.*

---

## 2 Problem Setup

Let

$$
\{\mathbf X_t\}_{t=0}^{T}\subset\mathcal X:=[0,1]^n,\qquad
\mathbf X_0\sim\rho_0
$$

evolve via the **time-stationary** conditional law

$$
\boxed{\mathbf X_{t+1}\mid \mathbf X_t=\mathbf x_t\sim\rho(\cdot\mid \mathbf x_t)} \tag{1}
$$


**Goal** Learn a map $F:\mathcal X\times\mathbb R^{d}\to\mathcal X$ s.t.

$$
\hat{\mathbf x}_{t+1}=F(\mathbf x_t,\boldsymbol\xi_t),\qquad
\boldsymbol\xi_t\stackrel{\text{i.i.d.}}{\sim}\mathcal N(0,I_d),
$$

approximates the law of $\mathbf X_{t+1}$.  Rolling $F$ autoregressively produces complete trajectories with **one forward pass per frame**.

---

## 3 Why a Naïve Regressor Fails

1. **One-to-Many ambiguity**
   In stochastic dynamics the same $\mathbf x_t$ can lead to *many* valid $\mathbf x_{t+1}$.

   > ![one-to-many](figures/one_to_many.png)
2. **Deterministic collapse**
   Minimizing MSE on $\mathcal D$ forces $F$ toward
   $\mathbb E[\mathbf X_{t+1}\mid\mathbf X_t=\mathbf x_t]$
   → blurs stochastic diversity.

---

## 4 Stochastic Lifting

### 4.1 Random Labels *Lift* the Data

Augment every pair with an independent Gaussian label:

$$
\mathcal D_\xi=\Bigl\{(\mathbf x_t^{i},\mathbf x_{t+1}^{i},\boldsymbol\xi_t^{i})\Bigr\},
\qquad \boldsymbol\xi_t^{i}\sim\mathcal N(0,I_d).
$$

Because labels are *almost surely unique*, the mapping problem becomes *one-to-one*:

$$
F(\mathbf x_t^{i},\boldsymbol\xi_t^{i})=\mathbf x_{t+1}^{i}. \tag{2}
$$

### 4.2 High Dimensionality ⇒ Smooth Interpolants

The Lipschitz constant necessary to fit (2) on the dataset is

$$
L(\mathcal D_\xi)=\max_{i\neq j,t}
\frac{\|\mathbf x_{t+1}^{i}-\mathbf x_{t+1}^{j}\|_2}
     {\sqrt{\|\mathbf x_t^{i}-\mathbf x_t^{j}\|_2^{2}
            +\|\boldsymbol\xi_t^{i}-\boldsymbol\xi_t^{j}\|_2^{2}}}.
$$

Labels lie on $\mathbb S^{d-1}$; inner products scale like $1/\sqrt d$ \[Vershynin 18].
Hence $L(\mathcal D_\xi)=\mathcal O\bigl(1/\sqrt d\bigr)$—**larger $d$ ⇒ smoother $F$**, which generalizes better.

### 4.3 Training Objective

$$
\boxed{
\mathcal L(\theta)=\frac1{MT}\sum_{i,t}
\bigl\|F_\theta(\mathbf x_t^{i},\boldsymbol\xi_t^{i})
      -\mathbf x_{t+1}^{i}\bigr\|_2^{2}}
\tag{3}
$$

(Replace with BCE for binary data.)
We use a plain U‑Net backbone; the diffusion‑time channel is repurposed for $\boldsymbol\xi_t$.

### 4.4 One-Step Inference

```text
for t = 0 … T-1:
    ξ_t  ~  N(0,I_d)
    x_{t+1} = F_θ(x_t, ξ_t)
```

One NN call.  **No diffusion steps, no distillation, no latent decoder.**

---

## 5 Theory:  Wasserstein‑2 Error Bound

> **Proposition 1**
> Let $F$ satisfy (2) and be $L_F$-Lipschitz.  Let
> $\hat\rho_{t+1}$ be the empirical law of generated samples
> and $\tilde\rho_{t+1}$ that of unseen test pairs. Then
>
> $$
> \mathbb E\bigl[W_2^{2}(\hat\rho_{t+1},\tilde\rho_{t+1})\bigr]
> \leC\bigl(1+2L_F^{2}\bigr)
> \min(M,\tilde M)^{-2/\alpha},
> $$
>
> where $\alpha$ is the intrinsic dimension of the largest of
> $\rho_t,\rho_{t+1},\nu$.

**Corollary** If $F(\mathbf x,\boldsymbol\xi)=\mathbf x+\mathrm dtR(\mathbf x,\boldsymbol\xi)$ (Euler‑like update) the bound scales as $L_R\mathrm dt$—good news because adjacent video frames differ by small $\mathrm dt$.

---

## 6 Experiments


### 6.1 Findings

* SL matches or beats ARDMs needing up to **40×** more calls.
* After a threshold ($d\gtrsim128$) accuracy is **robust** to label dimension.
* Removing current‑frame conditioning collapses performance ⇒ coupling is essential.

---

## 7 Limitations & Future Work

1. Fails for noise→data tasks; needs previous frame.
2. Very large $d$ may demand more data—scaling laws open.
3. Extending theory to non‑Lipschitz nets & multi‑frame conditioning is future work.

---

## 8 Takeaways

Random high‑dimensional labels + frame conditioning + plain regression
→ **real‑time one‑step generation** of videos & stochastic PDE trajectories *without* dynamic transport.

---

*Code & datasets:* *link redacted*
*Citation:* *see paper.*
