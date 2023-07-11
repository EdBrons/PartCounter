#!/usr/bin/env python

'''
Simple "Square Detector" program.

Loads several images sequentially and tries to find squares in each image.
'''

# Python 2/3 compatibility
from __future__ import print_function
import sys
import random
PY3 = sys.version_info[0] == 3

if PY3:
    xrange = range

import numpy as np
import cv2 as cv
import json


def angle_cos(p0, p1, p2):
    d1, d2 = (p0-p1).astype('float'), (p2-p1).astype('float')
    return abs( np.dot(d1, d2) / np.sqrt( np.dot(d1, d1)*np.dot(d2, d2) ) )

# expects r to be a tuple in the format (x, y, w, h)
def rect_area(r):
    return r[2] * r[3]

# returns the intersection of r1 and r2
# returns None if there is no overlap
def rect_overlap(r1, r2):
    left = max(r1[0], r2[0])
    right = min(r1[0] + r1[2], r2[0] + r1[2])
    bottom = min(r1[1] + r1[3], r2[1] + r2[3])
    top = max(r1[1], r2[1])
    if left < right and bottom > top:
        return (left, top, right - left, bottom - top)
    return None


# finds the contours of the parts in the image
# returns the bounding boxes of these contours
# trys to avoid duplicates by checking overlapping
def find_squares(img):
    img = cv.GaussianBlur(img, (5, 5), 0)
    squares = []
    for gray in cv.split(img):
        for thrs in xrange(0, 255, 10):
            if thrs == 0:
                bin = cv.Canny(gray, 0, 50, apertureSize=5)
                bin = cv.dilate(bin, None)
            else:
                _retval, bin = cv.threshold(gray, thrs, 255, cv.THRESH_BINARY)
            contours, _hierarchy = cv.findContours(bin, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                cnt_len = cv.arcLength(cnt, True)
                cnt = cv.approxPolyDP(cnt, 0.02*cnt_len, True)
                # check number of sides and area
                if len(cnt) == 4 and cv.contourArea(cnt) > 1000 and cv.contourArea(cnt) < 40000 and cv.isContourConvex(cnt):
                    cnt = cnt.reshape(-1, 2)
                    max_cos = np.max([angle_cos( cnt[i], cnt[(i+1) % 4], cnt[(i+2) % 4] ) for i in xrange(4)])
                    # check to make sure it has approximately right angles
                    if max_cos < 0.1:
                        # check to see if it overlaps with any other squares
                        r1 = cv.boundingRect(cnt)
                        overlaps = False
                        for r2 in squares:
                            r3 = rect_overlap(r1, r2)
                            if r3 is not None:
                                a1 = rect_area(r1)
                                a2 = rect_area(r2)
                                a3 = rect_area(r3)
                                overlap_perc = a3 / (a1 + a2 - a3)
                                if overlap_perc > .5:
                                    overlaps = True
                                    break
                        if not overlaps:
                            squares.append(r1)
    return squares

def main():
    if len(sys.argv) != 2:
        print('Usage: ./main.py [filename]')
        return 1

    fn = sys.argv[1]
    img = cv.imread(fn)
    squares = find_squares(img)
    
    data = {}
    data["rects"] = []
    data["filename"] = fn
    
    for br in squares:
        # color = (random.randint(0,256), random.randint(0,256), random.randint(0,256))
        # cv.rectangle(img, (int(br[0]), int(br[1])), \
        # (int(br[0]+br[2]), int(br[1]+br[3])), color, 2)
        data["rects"].append([ br[0], br[1], br[2], br[3] ])


    json_fn = fn.split('.')[0] + '.json'
    
    with open(json_fn, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    # cv.namedWindow('img', cv.WINDOW_NORMAL)
    # cv.imshow("img", img)
    # cv.waitKey()

    print('Done')


if __name__ == '__main__':
    print(__doc__)
    main()
    cv.destroyAllWindows()