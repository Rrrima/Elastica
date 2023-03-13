def isNotNull(x):
    if isinstance(x, list):
        if x: 
            if x[0]:
                return True
        else:
            return False