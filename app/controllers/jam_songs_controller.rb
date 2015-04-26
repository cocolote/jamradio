class JamSongsController < ApplicationController
  respond_to :json

  def index
    songs = JamSong.where(jam_id: params[:jam_id])
    respond_to do |format|
      format.json { render json: { songs_number: songs.size } }
    end
  end

  def create
    @song = Song.find_or_create_by(song_params)
    @jam = Jam.find(params[:jam_id])
    @jam_song = JamSong.new(jam: @jam, song: @song)
    if @jam_song.save
      respond_to do |format|
        format.json { render json: { message: "Song added to #{@jam.name} jam" } }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @jam_song.errors.full_messages }, status: 403 }
      end
    end
  end

  def destroy
    @jam_song = JamSong.find_by(jam_id: params[:jam_id], song_id: params[:id])
    JamSong.delete(@jam_song)
    respond_to do |format|
      format.json { render json: { message: "The song was deleted" } }
    end
  end

  protected

  def song_params
    params.require(:song).permit(:sc_song_id, :title, :duration)
  end
end
