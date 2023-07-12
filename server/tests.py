import unittest
import cv2 as cv
from .findsquares import find_squares


        
class TestPartCount(unittest.TestCase):
    def test_counts(self):
        cases = [ ( './public/images/1.JPG', 120 ), ( './public/images/6.JPG', 120 ) ]
        for fn, expected in cases:
            with self.subTest(name=fn):
                img = cv.imread(fn)
                rects = find_squares(img)
                self.assertEqual(len(rects), expected)

if __name__ == '__main__':
    unittest.main()