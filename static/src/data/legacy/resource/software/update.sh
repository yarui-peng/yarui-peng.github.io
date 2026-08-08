#!/bin/bash
tfile=`YRMTMP /YWeb`

for type in tool dev
do
	ofile=$type.csv
	rm -f $ofile
	declare -A AllCatg=() AllName=() AllVers=() AllHelp=()
	for folder in /e3da/base/lmod/$type/*/*
	do
		catg=`basename $folder`
		AllCatg[$catg]=1
		
		Names=()		
		for subdir in $folder/*
		do			
			name=`basename $subdir`
			
			Names+=($name)
			
			Vers=()
					
			for file in $subdir/*.lua
			do
				Vers+=(`basename $file .lua`)
			done
			
			if (( ${#Vers[@]} ))
			then			
				help=`sed -n 's/YModBasic("\([^"]*\)")/\1/p' $file`
				
				AllVers[$catg-$name]="${Vers[@]}"
				AllHelp[$catg-$name]=$help		
			
			fi
		done
		
		for name in "${Names[@]}"
		do
			AllName[$catg-$name]=1
		done

	done
	
	for key in "${!AllCatg[@]}"
	do
		rm -f $tfile
		echo -n "$key:"
		for str in "${!AllName[@]}"
		do					
			fields=(${str/\-/ })

			catg=${fields[0]}
			
			if [ "$catg" = "$key" ]
			then
				name=${fields[1]}
				
				help=${AllHelp[$catg-$name]}
				vers=${AllVers[$catg-$name]}
				
				echo -n " $name ($vers),"
				echo "$name,\"$help\",$vers" >> $tfile
			fi
		done
		echo " done."
		echo "$key" >> $ofile
		sort -t ',' -k1 $tfile >> $ofile
	done
done
