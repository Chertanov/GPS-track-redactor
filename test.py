from collections.abc import Sequence
from typing import TypeVar,Union,Literal

T = TypeVar('T')      # Declare type variable
S = TypeVar("S", bound=str)

def first(l: Sequence[any]) -> any:   # Generic function
    return l[0]

def capitalize_print(word:S):
    if isinstance(word,str): 
        print(word.capitalize())

print(first([1,2,3,4]))
capitalize_print("item")
capitalize_print(54)

def triple(string: Union[str, bytes]):
    return string*3

AnyString = TypeVar("AnyString", str, bytes)

def triple1(string: AnyString):
    return string*3

scream = triple1('A')
item = scream + "!"
print(item)