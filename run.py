import datetime
current_datetime = datetime.datetime.now()     
formatted_datetime = current_datetime.strftime("%Y-%m-%d %H:%M:%S")

print(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

def megmegmegamega(fecha_alta):
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") if fecha_alta == None else  fecha_alta

print(megmegmegamega("megamega"))
