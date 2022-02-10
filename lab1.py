import math
import matplotlib.pyplot as plt

# Mykyta Kanyuka, IO-81
# Variant 10

PART_COUNT = 10

# Mean Time to Failure (MTTF)
mttf_arr = [
    1325, 977, 243, 3, 145, 997, 27, 67, 30, 934,
    1039, 240, 371, 86, 164, 96, 156, 145, 280,
    444, 887, 726, 41, 503, 174, 1809, 349, 532,
    1541, 148, 489, 198, 4, 761, 389, 37, 317,
    1128, 514, 426, 23, 184, 365, 153, 624, 31,
    49, 1216, 61, 189, 286, 1269, 365, 1085,
    279, 228, 95, 391, 683, 39, 7, 486, 715, 204,
    1553, 736, 1622, 1892, 448, 23, 135, 555,
    252, 569, 8, 491, 724, 331, 1243, 567, 788,
    729, 62, 636, 227, 227, 245, 153, 151, 217,
    1009, 143, 301, 342, 48, 493, 117, 78, 113,
    67
]

gamma = 0.74
probability_time = 1586
lambda_time = 1798

mttf_arr.sort()
mttf_max = max(mttf_arr)


def average(values):
    return sum(values)/len(values)

def count(ls, cond):
    return sum([cond(elem) for elem in ls])

def in_interval(start, end):
    def f(t):
        return start < t <= end

    return f

def Ni(ts, interval_start, interval_end):
    return count(ts, in_interval(interval_start, interval_end))


class ProbabilityDensityFunc:
    def __init__(self, ts, steps = 10):
        t_max = max(ts)
        h = t_max / steps
        N = len(ts)
        self.fs = [
            Ni(ts, part*h, (part + 1)*h)/ (N * h)
            for part in range(0, steps)
        ]
        self.h = h

    def __call__(self, t):
        part = math.floor(t / self.h)

        if (t == mttf_max):
            return self.fs[-1]
        
        if (part < 0 or len(self.fs) <= part):
            raise Exception(f"Unknown interval {t=} {part=}")

        return self.fs[part] 

    def integral(self, start, end):
        if start > end:
            raise Exception(f"Invalid interval from {start} to {end}")
        start = max(start, 0)
        end = min(end, len(self.fs) * self.h)
        
        _start = math.floor(start / self.h) * self.h
        _end = math.ceil(end / self.h) * self.h

        _start_index = math.floor(start / self.h)
        _end_index = math.ceil(end / self.h) - 1

        return sum(self.fs[_start_index:_end_index+1]) * self.h \
            - (
                (_end - end)*self.fs[_end_index] 
                if _end_index  < len(self.fs) else 0
            ) \
            - (
                (start - _start)*self.fs[_start_index] 
                if _start_index < len(self.fs) else 0
            )
            
class FailureProbability:    
    def __init__(self, f):
        self.f = f

    def __call__(self, t):
        return self.f.integral(0, t)

class Uptime:
    def __init__(self, f):
        self.f = f

    def __call__(self, t) -> float:
        return 1 - self.f.integral(0, t)

class FailureRate:
    def __init__(self, ts, steps=10):
        self.f = ProbabilityDensityFunc(ts, steps=steps)
        self.p = Uptime(self.f)
    
    def __call__(self, t):
        return self.f(t) / self.p(t)

class MeanTimeToFailure:
    def __init__(self, ts, steps=10):
        self.ts = ts
        self.h = max(ts) / steps
        self.steps = steps
        self.f = ProbabilityDensityFunc(ts, steps=steps)
        self.p = Uptime(self.f)
        
    def __call__(self, gama):
        if gama <= 0 or gama > 1:
            raise Exception(f"Invalid gama value, {gama=}")
        
        h = self.h
        i = 0
        while self.p(i*h) >= gama and self.p(i*h) != 0:
            i+=1

        ti = i * h
        ti_ = (i - 1) * h
        
        return ti - h*self.d(ti, ti_, gama)

    def d(self, ti, ti_, gama):
        return (self.p(ti) - gama) / (self.p(ti) - self.p(ti_))


f_star = ProbabilityDensityFunc(mttf_arr, steps=PART_COUNT)
q_star = FailureProbability(f_star)
p_star = Uptime(f_star)
lambda_star = FailureRate(mttf_arr, steps=PART_COUNT)
gamma_star = MeanTimeToFailure(mttf_arr, steps=PART_COUNT)


print(f"Середній наробіток до відмови: {average(mttf_arr)}")
print(f"Гама відсотоковий наробітку на відмову ({gamma=}): {gamma_star(gamma)}")
print(f"Ймовірність безвідмовної роботи протягом {probability_time} (P): {p_star(probability_time)}")
print(f"Інтенсивність відмови на час {lambda_time}: {lambda_star(lambda_time)}")


# Graphic Representation
x = [*range(mttf_max+1)]
f_y = [f_star(xi) for xi in x]
p_y = [p_star(xi) for xi in x]
q_y = [q_star(xi) for xi in x]
gamma_x = [*map(lambda x: x/100,range(1, 101))]
gamma_y = [gamma_star(gamma_i) for gamma_i in gamma_x]

fig, axs = plt.subplots(2, 2)
axs[0, 0].plot(x, f_y)
axs[0, 0].set_title('F*(t)')
axs[0, 1].plot(x, p_y, 'tab:green')
axs[0, 1].set_title('P*(t)')
axs[1, 0].plot(x, q_y, 'tab:orange')
axs[1, 0].set_title('Q*(t)')
axs[1, 1].plot(gamma_x, gamma_y, 'tab:red')
axs[1, 1].set_title('T(gamma)')

plt.show()