from websocket_server import WebsocketServer
import threading
import os
import json
from gesture import HandPosAnalyzer, GestureClassifier
import torch
from torch import nn

import sys
import ssl
from optparse import OptionParser
import threading

from unidecode import unidecode
from operator import index
from re import I
import time
from xml.etree.ElementPath import xpath_tokenizer
from xml.sax import xmlreader
import logging
import sys
import string
from nltk.metrics.distance import edit_distance
import os
from Levenshtein import distance as lev
from rapidfuzz import fuzz
from rapidfuzz.process import extractOne
from rapidfuzz.string_metric import levenshtein, normalized_levenshtein
from rapidfuzz.fuzz import WRatio
import nltk
from nltk.tokenize import word_tokenize
from nltk.tokenize import TweetTokenizer
from nltk.tokenize import WhitespaceTokenizer
from nltk.stem import PorterStemmer
from nltk.stem.snowball import SnowballStemmer
nltk.download('punkt')

from collections import deque
ps = SnowballStemmer(language='english')

server = None
clients = []
# allHandPosResults = []
# handAnalyzer = None
# model = {}
# device = "cuda" if torch.cuda.is_available() else "cpu"
# model['left'] = GestureClassifier().to(device)
# model['left'].load_state_dict(torch.load('model/gesture_left'))
# model['right'] = GestureClassifier().to(device)
# model['right'].load_state_dict(torch.load('model/gesture_right'))
# print("model loaded!")

windowSize = 3
consumedResponse = []
wordDict = {}
wordTrigram = {}
stitchedResponse = deque(maxlen=windowSize)
script = deque(maxlen=10)
counter = 0
wordCounter = 0
wordCounterTrigram = 0
lastWordCounter = -1
wordIndex = 0
deviatedMatchFlag = 0
wordChanged = False
numOfWordsChanged = 0
compoundWord = False


def window(seq, n=5):
    it = iter(seq)
    win = deque((next(it, None) for _ in range(n)), maxlen=n)
    yield win
    append = win.append
    for e in it:
        append(e)
        yield win

def clearResponse():
    global consumedResponse
    consumedResponse = []


def diffResponses(list1, list2):
    list3 = []
    list3 = list2[len(list1):]
    return list3

def diffAllResponses(list1, list2):
    global wordChanged
    global numOfWordsChanged
    global consumedResponse
    break_out_flag = False

    list3 = []
    list4 = []
    list5 = []
    list6 = list2[:len(list1)]
    list4 = list2[len(list1):]
    logging.debug(list1)
    logging.debug(list2)
    
    if (len(list1) == 0 or len(list2) == 0):
        list5 = list2

    elif (len(list2) >= len(list1)):
        logging.debug("len of list1 {0}".format(len(list1)))
        for i in range(len(list1), 0, -1):
            logging.debug(list1)
            logging.debug(list6)
            logging.debug("compare {0} with {1}".format(list1[i-1], list6[i-1]))
            if list1[i-1] != list6[i-1]:
                logging.debug("last element not same")
                list3.append(list6[i-1])
                wordChanged = True
                logging.debug("numOfWordsChanged before {0}". format(numOfWordsChanged))
                numOfWordsChanged = numOfWordsChanged + 1
                logging.debug("numOfWordsChanged after {0}". format(numOfWordsChanged))
            else:
                logging.debug("found same at {0}".format(i-1))
                break_out_flag = True
                break

        logging.debug("break_out_flag {0}".format(break_out_flag))
        logging.debug(list3)
        logging.debug("list4 {0}".format(list4))
        if list3:
            list3.reverse()
            list5 = list3 + list4
            logging.debug("reversed and added")

            if (wordChanged):
                for i in range (0, numOfWordsChanged):
                    logging.debug("Number of error words pop from consumed response list {0}".format(numOfWordsChanged))
                    consumedResponse.pop()
        else:
            list5 = list4

    elif(len(list2) < len(list1)):
        consumedResponse = list2
        list5 = []

    return list5

def parseScript(inScript):
    try:
        global wordDict
        wordDict = {}
        global wordTrigram
        wordTrigram = {}
        wordLines = {}
        lineNum = 0
        global wordCounter
        wordCounter = 0
        wordCounterTrigram = 0
        wordHistory = []

        fileContent = inScript
        # for converting the non-ASCII characters
        fileContent = unidecode(fileContent)
        sentenceTokens = nltk.sent_tokenize(fileContent)
        for sentence in sentenceTokens:
            lineNum += 1
          #   # Split the line into words delimited by whitespace.
          #   words = sentence.split()
          #   # Remove unwanted delimiter characters adjoining words.
          #   words2 = [ word.strip(delimiter_chars).lower() for word in words ]

            # Find and save the occurrences of each word in the line.
            tknzr = TweetTokenizer()
            words = tknzr.tokenize(sentence)
            words2 = [word.lower() for word in words if word not in (string.punctuation + "..." + "..")]

            for word in words2:
                if wordDict.__contains__(word):
                    wordDict[word].append(wordCounter)
                else:
                    wordDict[word] = [wordCounter]
                wordCounter += 1

            for word in words2:
                try:
                    wordLines[lineNum].append(word)
                except KeyError:
                    wordLines[lineNum] = [word]

            for word in words2:
                wordHistory.append(word)
                if (wordCounterTrigram >= windowSize-1):
                    wordHistoryList = [wordHistory[-3], wordHistory[-2], word]
                    try:
                        wordTrigram[tuple(wordHistoryList)].append(
                            wordCounterTrigram)
                    except KeyError:
                        wordTrigram[tuple(wordHistoryList)] = [
                            wordCounterTrigram]
                wordCounterTrigram += 1

        logging.info(
            "Processed {} lines from the reference script".format(lineNum))

        if lineNum < 1:
            logging.info("No lines found in text file, no index file created.")
            sys.exit(0)
        return(wordTrigram, wordCounter, wordDict)

    except IOError as ioe:
        sys.stderr.write("Caught IOError: " + repr(ioe) + "\n")
        sys.exit(1)
    except Exception as e:
        sys.stderr.write("Caught Exception: " + repr(e) + "\n")
        sys.exit(1)


def closest(lst, K):
    closestIndex = lst[min(range(len(lst)), key=lambda i: abs(lst[i]-K))]
    return closestIndex


def getKeyFromValue(d, val):
    key = None
    for k, v in d.items():
        for item in v:
            if (item == val[0]):
                key = k
    if key:
        return key
    return None


def getUniqueWordsFromInput(data):
    global consumedResponse
    response = data.split()
    response = diffAllResponses(consumedResponse, response)
    if not consumedResponse:
        consumedResponse = response
    else:
        consumedResponse = consumedResponse + response
    return response


def getWordIndex(answer):

    global consumedResponse
    global counter
    global stitchedResponse
    global lastWordCounter
    global wordIndex
    global deviatedMatchFlag
    global wordChanged
    global numOfWordsChanged
    global symArr


    if (wordChanged):
        logging.debug("numOfWordsChanged {0}".format(numOfWordsChanged))
        for i in range (0, min(numOfWordsChanged,3)):
            logging.debug("transcription error pop {0}".format(numOfWordsChanged))
            stitchedResponse.pop()
        wordChanged = False
        numOfWordsChanged = 0
    
    stitchedResponse.append(answer)
    stitchedResponseTuple = tuple(stitchedResponse)
    logging.debug("Stitched Response: {0}".format(stitchedResponse))

    # exact tri-gram match found and check for the nearest match
    if ((len(stitchedResponseTuple) == windowSize) and (stitchedResponseTuple in wordTrigram)):
        logging.debug("deviatedMatchFlag {0}".format(deviatedMatchFlag))
        # get candidates if multiple tri-grams are present
        candidate_values = wordTrigram.get(stitchedResponseTuple)
        # check for six or more words being spoken if deviating from the script 
        if wordIndex not in range(lastWordCounter - 1, lastWordCounter + 3) and deviatedMatchFlag < 6:
            wordIndex = lastWordCounter
            case = "(0) far away exact match"
            deviatedMatchFlag += 1
        else:
            wordIndex = closest(candidate_values, lastWordCounter)
            deviatedMatchFlag = 0
            case = "(1) exact match"

    elif((len(stitchedResponseTuple) == windowSize) and (stitchedResponseTuple not in wordTrigram) and (lastWordCounter+1 != wordCounter)):
        y = []
        # if (lastWordCounter + 3 < wordCounter):
        #     for i in range(lastWordCounter+1, lastWordCounter + 4):
        #         y.append(getKeyFromValue(wordDict, [i]))
        if(lastWordCounter + 2 < wordCounter):
            for i in range(lastWordCounter+1, lastWordCounter + 3):
                y.append(getKeyFromValue(wordDict, [i]))
        elif(lastWordCounter + 1 < wordCounter):
            for i in range(lastWordCounter+1, lastWordCounter + 2):
                y.append(getKeyFromValue(wordDict, [i]))

        fuzzSimilarity = extractOne(answer, y, scorer=WRatio)
        logging.debug(fuzzSimilarity)
        # missed word and next one gets added to tri-gram
        if(answer in wordDict and closest(wordDict.get(answer), lastWordCounter) in range(lastWordCounter - 1, lastWordCounter + 1)):
            wordIndex = closest(wordDict.get(answer), lastWordCounter)
            case = "(2a) missed word"
            # to do: update the tuple for old values?

        elif (fuzzSimilarity[1] > 50 and (fuzzSimilarity[0]).startswith(answer[0])):
            wordIndex = closest(wordDict.get(fuzzSimilarity[0]), lastWordCounter)
            case = "(2b) fuzzy match, transcription error"
            # to do: test the updates list for popping old values?
            logging.debug("Fuzzy matching popping out {0}".format(answer))
            stitchedResponse.pop()
            stitchedResponse.append(fuzzSimilarity[0])
        else:
            wordIndex = lastWordCounter
            case = "(2c) ignore from trigram"
            # to do: update the tuple for old values?
        
    elif(answer in wordDict and wordDict.get(answer)[0] in range(lastWordCounter + 1, lastWordCounter + 3)):
        wordIndex = wordDict.get(answer)[0]
        case = "(3) word in dictionary and in range"

    # look for fuzzy match in the next three words when we begin speaking
    elif (answer not in wordDict and len(stitchedResponseTuple) < windowSize):
        y = []
        y = [getKeyFromValue(wordDict, [lastWordCounter+1]), getKeyFromValue(wordDict, [lastWordCounter + 2]), getKeyFromValue(wordDict, [lastWordCounter + 3])]
        fuzzSimilarity = extractOne(answer, y, scorer=WRatio)
        if(fuzzSimilarity[1] > 50 and (fuzzSimilarity[0]).startswith(answer[0])):
            wordIndex = closest(wordDict.get(fuzzSimilarity[0]), lastWordCounter)
            case = "(4a) fuzzy match for small chunk, transcription error"
            stitchedResponse.pop()
            stitchedResponse.append(fuzzSimilarity[0])
        else:
            wordIndex = lastWordCounter
            case = "(4b) ignore small chunk"
    else:
        wordIndex = lastWordCounter
        case = "(5) word not found"

    # prevent going backwards to ease readability when someone stumbles/repeats and moves ahead
    if(wordIndex < lastWordCounter):
        logging.debug("moved ahead, staying at last lastWordCounter")
        wordIndex = lastWordCounter


    lastWordCounter = wordIndex
    
    logging.debug("Word: {0}, word index = {1}, case = {2}".format(answer, wordIndex, case))
    return wordIndex


###########################################

def new_client(client, server):
    clients.append(client)
    print("New client connected and was given id %d" % client['id'])

def client_left(client, server):
    clients.remove(client)
    print("Client(%d) disconnected" % client['id'])

def message_received(client, server, message):
    # print("Client(%d) said: %s" % (client['id'], message))
    message=json.loads(message)
    send_message(message)

def warp(name,s):
    return json.dumps({name:s})

def warpdict(dict):
    return json.dumps(dict)

def run_server():
    global server
    global clients
    server = WebsocketServer(host='127.0.0.1',port=8000)
    print('serving on port 8000...')
    server.set_fn_new_client(new_client)
    server.set_fn_client_left(client_left)
    server.set_fn_message_received(message_received)
    server.run_forever()

def send_message(message):
    global model
    global handAnalyzer
    global wordCounter
    global wordIndex
    global lastWordCounter
    global stitchedResponse
    global consumedResponse

    funcname = message['name']
    params = message['params']

    if funcname == 'registerHandAnalyzer':
        # register new analyzer
        handAnalyzer = HandPosAnalyzer(model, params["handed"])
        # handPosAnalyzers[params["relatedText"]] = handAnalyzer
        print("register handpose analyzer for : {}".format(params["relatedText"]))
        result = {'name':'registerHandAnalyzer'}
        server.send_message_to_all(warpdict(result))

    if funcname == 'destroyHandAnalyzer':
        result = {'name': "destroyHandAnalyzer"}
        server.send_message_to_all(warpdict(result))

    if funcname == 'getAnimationParam':
        handPosArr = params['handPosArr']
        handCenterArr = params['handCenterArr']
        res =  handAnalyzer.getGestureType(handPosArr,handCenterArr )
        result = {"name":'returnAnimationParam', "gesture": res[0], "avgDis": res[1],"dirVec": res[2] }
        server.send_message_to_all(warpdict(result))

    if (funcname == 'populateScript'):
        scriptText = params['referenceScript']
        wordTrigram, wordCounter, wordDict = parseScript(scriptText)
        logging.debug('Number of words: {0}'.format(wordCounter))
        logging.debug('Number of words: {0}'.format(wordCounter))
        server.send_message_to_all(warp('words',str(wordCounter)))
        wordIndex = 0 
        lastWordCounter = -1
        stitchedResponse.clear()
        consumedResponse.clear()

    elif(funcname == "transcriptionComplete"):
        clearResponse()   
        lastWordCounter = -1
        wordCounter = 0

    elif (funcname == "scriptFollowing" and wordCounter > 1):
        wordsFromInput = getUniqueWordsFromInput(params['transcript'])
        logging.debug("lastWordCounter {0}".format(lastWordCounter))
        logging.debug("wordIndex {0}".format(wordIndex))
        logging.debug("wordCounter {0}".format(wordCounter))
        if not wordsFromInput:
            wordIndex = lastWordCounter
            server.send_message_to_all(warp('wid',str(wordIndex)))
            logging.debug("unique words from input are empty")
        else:
            # logging.debug("receiving: {0}".format(data))
            logging.debug("unique words: {0}".format(wordsFromInput))
            for answer in (wordsFromInput):
                wordIndex = getWordIndex(answer)
                lastWordCounter = wordIndex
                server.send_message_to_all(warp('wid',str(wordIndex)))

if __name__ == "__main__":
    t = threading.Thread(target=run_server)
    t.start()
