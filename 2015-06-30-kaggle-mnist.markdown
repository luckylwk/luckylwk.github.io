---
layout: post
comments: true
title:  "Kaggle: MNIST - Image recognition on handwritten digits"
excerpt: "Description here..."
date:   2015-06-30 20:00:00
mathjax: true
---

Introduction... links


### Data - MNIST Handwritten Digits

Load the data from the CSV's as they are provided by Kaggle.

~~~python
import numpy as np
import pandas as pd

# Read the data into pandas DataFrames
df_train = pd.read_csv('train.csv') 
df_test = pd.read_csv('test.csv') 

# Create the input matrices and the output-vector.
y_train = df_train.values[:, 0]
X_train = df_train.values[:, 1:]
X_test = df_test.values

print 'Training size: {}'.format(X_train.shape) 
print 'Testing size: {}'.format(X_test.shape)
~~~
~~~python
Training size: (42000, 784)
Testing size: (28000, 784) 
~~~

Globally standardize the datasets.

~~~python
# Standardize the data.
X_max = np.max(X_train)
X_min = np.min(X_train)
X_train = X_train / ( X_max - X_min )
X_test = X_test / ( X_max - X_min )

X_train = X_train.astype(np.float)
y_train = y_train.astype(np.int32)

print 'Mean of the Training set: {}'.format(X_train.mean())
print 'Standard deviation of the Training set: {}'.format(X_train.std())
~~~
~~~python
Mean of the Training set: 0.00678176627794
Standard deviation of the Training set: 0.08207176082
~~~

The data is now ready to go. We have a training-matrix `X_train` with associated training labels `y_train` and a testing-matrix `X_test` that we need to predict on.

### Model

Classification problem... possibilities: KNN, Neural Nets, SVC, RF.

#### KNN - K-Nearest-Neighbours

Distance function. Cannot provide probability but instead gives a class.
