import math
import torch
from torch import nn
import numpy as np
from utils import isNotNull

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
        self.gestureMap = {0: 'flat', 1: 'hold', 2: 'pinch', 3: 'pointing' }
        self.model = model
        self.garr = {'left': [], 'right': []}
        self.handed = handed 
        


    def predGesture(self, vec):
        handed = self.handed
        if isNotNull(vec):
            posVec = torch.tensor([vec])
            output = self.model[handed](posVec)
            _, predicted = torch.max(output.data, 1)
            gesture = self.gestureMap[predicted.numpy()[0]]
        else:
            gesture = None
        return gesture
    
    def preprocessSignal(self, garr):
        handed = self.handed
        if len(self.garr[handed]) < 2:
            self.garr[handed] = np.copy(arr)
        else: 
            preEle = self.garr[handed][-2]
            checkEle = self.garr[handed][-1]
            newEle = np.array(arr[-1])
            # handle wrong detection with average
            if isNotNull(newEle) and isNotNull(preEle) and not isNotNull(checkEle):
                self.garr[handed][-1] = (newEle + preEle) / 2
            self.garr[handed].append(newEle)
        print(self.garr)
        
    def getAnimationParam(self, garr):
        self.preprocessSignal(garr)
        # for g in garr:
        #     pred = self.predGesture(handed,g)
        #     predictedGestures.append(pred)
        # return predictedGestures