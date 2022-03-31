import pandas as pd
# df = pd.read_csv('./outdata_filter_event.csv',encoding='UTF-8')
# df.sort_values(df.columns[0] , inplace = True ,ascending=True )
# df = df.head(1043)
# df.to_csv("./outdata_filter_event_1.csv",index=False )

df = pd.read_csv('./outdata_filter_event_1.csv',encoding='UTF-8')
result = {}
names = df["name"].unique()
print(names)
for name in names:
    tempdf = df.loc[df['name'] == name]
    tempdf.sort_values(df.columns[2] , inplace = True ,ascending=True )
    event_seq = []
    for index , row in tempdf.iterrows():
        event_seq.append({tempdf.loc[index, "event"] : tempdf.loc[index, "time"]})
    result[name] = event_seq
    # result.append({name : event_seq})

print(result)
# with open('./simulatedata.json' , 'w') as f:
#     f.write(str(result))



