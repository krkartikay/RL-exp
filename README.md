# RL experiments

A pretty simple implementation of Deep Q Learning, made from scratch
using tensorflow.js. Run it on your browser now! http://kartikay26.github.io/RL-exp/

Screenshots:

[TODO]

The visualisation shows an agent (blue circle) which tries to reach a fixed target (yellow star).
It gets a reward of -1 per turn, and +20 reward upon reaching the target. Therefore it should
try to reach the target in minimum number of moves to get the maximum reward.

The RandomAgent takes a random action every turn, and gets an overall negative average reward.

The DQN agent uses a small neural network to learn the Q-values of each state-action pair. It starts
out behaving somewhat randomly but soon learns the optimal policy and gets a positive average reward
per episode.