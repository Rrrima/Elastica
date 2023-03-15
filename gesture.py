import math
import torch
from torch import nn
import numpy as np
from utils import isNotNull

def most_common(lst):
    return max(set(lst), key=lst.count)

def calDistance(cordArr):
    totalDis = 0
    dirVec = [0,0]
    n = 0
    for i in range(len(cordArr)-1):
        if cordArr[i][0] and cordArr[i+1][0]:
            n += 1
            totalDis += math.dist(cordArr[i+1], cordArr[i])
            dirVec[0] += cordArr[i+1][0] - cordArr[i][0]
            dirVec[1] += cordArr[i+1][1] - cordArr[i][1]
    if n>0:
        return totalDis/n, dirVec
    else:
        return 999, dirVec

class GestureClassifier(nn.Module):
    def __init__(self):
        super(GestureClassifier,self).__init__()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(24, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 4),
        )
    def forward(self,x):
        logits = self.linear_relu_stack(x)
        return logits
    
class HandPosAnalyzer:
    def __init__(self,model, handed):
        self.gestureMap = {0: 'staging', 1: 'pinch', 2: 'pinch', 3: 'pointing', None: 'None' }
        self.model = model
        self.garr = {'left': [], 'right': []}
        self.carr = {'left':[],'right':[]}
        self.handed = handed 

    def predGesture(self, vec):
        handed = self.handed
        # print(vec)
        # print(isNotNull(vec))
        if isNotNull(vec):
            posVec = torch.tensor([vec.tolist()])
            output = self.model[handed](posVec)
            _, predicted = torch.max(output.data, 1)
            gesture = predicted.numpy()[0]
        else:
            gesture = None
        return gesture

    def predGestures(self):
        gestureArr = []
        for vec in self.garr[self.handed]:
           g = self.predGesture(vec)
           gestureArr.append(g)       
        return gestureArr             
    
    def preprocessSignal(self, garr, carr):
        handed = self.handed
        if len(self.garr[handed]) < 2:
            self.garr[handed] = np.copy(garr)
            self.carr[handed] = np.copy(carr)
        else: 
            preEle = self.garr[handed][-2]
            checkEle = self.garr[handed][-1]
            newEle = np.array(garr[-1])
            # handle wrong detection with average
            if isNotNull(newEle) and isNotNull(preEle) and not isNotNull(checkEle):
                self.garr[handed][-1] = (newEle + preEle) / 2
                self.carr[handed][-1] = (np.array(carr[-1]) + self.carr[handed][-2]) / 2
            self.garr[handed] = np.append(self.garr[handed],[newEle],axis = 0)[-10:]
            self.carr[handed] = np.append(self.carr[handed],[np.array(carr[-1])],axis = 0)[-10:]
                
    def getGestureType(self, garr, carr):
        self.preprocessSignal(garr,carr)
        gestureArr = self.predGestures()
        # get the predicted gesture
        gesture = self.gestureMap[most_common(gestureArr)]
        avgDis,dirVec = calDistance(self.carr[self.handed])
        return (gesture, avgDis, dirVec)    

        # for g in garr:
        #     pred = self.predGesture(handed,g)
        #     predictedGestures.append(pred)
        # return predictedGestures